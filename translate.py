#!/usr/bin/env python3
"""
Batch Translation Script for DeepL — Flexxy
Translates frontend/locales/source.en.json → frontend/locales/{lang}.json
Default language: Czech (cs)
"""

import json
import os
import time
from pathlib import Path
from typing import Dict

# Prefer env; fallback to known free-tier key (same as cdot-landing)
DEEPL_API_KEY = os.environ.get(
    "DEEPL_API_KEY",
    "6462a264-e1c8-4ebe-9120-d2e4d97ccfef:fx",
)

LANGUAGE_CODES = {
    "cs": "CS",
    "es": "ES",
    "fr": "FR",
    "de": "DE",
    "it": "IT",
    "pt": "PT-PT",
    "pl": "PL",
    "nl": "NL",
}

LANGUAGE_NAMES = {
    "cs": "Czech",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "pl": "Polish",
    "nl": "Dutch",
}


def load_json(filepath: Path) -> Dict:
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(filepath: Path, data: Dict, indent: int = 2):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)
        f.write("\n")


def flatten_dict(d: Dict, prefix: str = "") -> Dict[str, str]:
    items = {}
    for key, value in d.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            items.update(flatten_dict(value, full_key))
        elif isinstance(value, str):
            items[full_key] = value
    return items


def collect_missing_keys(source: Dict, target: Dict, prefix: str = "") -> Dict[str, str]:
    missing = {}
    for key, value in source.items():
        if isinstance(value, str):
            if key not in target or target[key] == "":
                missing[key] = value
        elif isinstance(value, dict):
            full_key = f"{prefix}.{key}" if prefix else key
            if key not in target or not isinstance(target[key], dict):
                missing.update(flatten_dict(value, full_key))
            else:
                missing.update(collect_missing_keys(value, target[key], full_key))
    return missing


def translate_batch_with_deepl(texts: list, target_lang: str, api_key: str) -> list:
    try:
        import deepl
    except ImportError:
        raise Exception("DeepL library not installed. Run: pip install deepl")

    if not api_key:
        raise Exception("DeepL API key not set.")

    translator = deepl.Translator(api_key)
    results = translator.translate_text(
        texts,
        source_lang="EN",
        target_lang=target_lang,
        preserve_formatting=True,
        tag_handling="html",
    )
    if isinstance(results, list):
        return [r.text for r in results]
    return [results.text]


def merge_dicts(target: Dict, updates: Dict) -> Dict:
    for key, value in updates.items():
        if isinstance(value, dict) and key in target and isinstance(target[key], dict):
            target[key] = merge_dicts(target[key], value)
        else:
            target[key] = value
    return target


def _default_lang_progress():
    return {"completed_batches": 0, "total_batches": 0, "completed": False}


def create_progress_file(locales_dir: Path):
    progress_file = locales_dir / ".translation_progress.json"
    if progress_file.exists():
        with open(progress_file, "r", encoding="utf-8") as f:
            progress = json.load(f)
    else:
        progress = {}
    for lang_code in LANGUAGE_NAMES:
        if lang_code not in progress:
            progress[lang_code] = _default_lang_progress()
    return progress


def save_progress(locales_dir: Path, progress: dict):
    progress_file = locales_dir / ".translation_progress.json"
    with open(progress_file, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Batch translate Flexxy i18n JSON using DeepL")
    parser.add_argument("--lang", default="cs", help="Language code (default: cs)")
    parser.add_argument(
        "--source",
        default="frontend/locales/source.en.json",
        help="Source file (default: frontend/locales/source.en.json)",
    )
    parser.add_argument("--api-key", help="DeepL API key (or DEEPL_API_KEY env)")
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--batches-per-run", type=int, default=20)
    parser.add_argument("--reset", action="store_true", help="Reset progress for target language")
    args = parser.parse_args()

    api_key = args.api_key or DEEPL_API_KEY
    if not api_key:
        print("❌ Error: DeepL API key required")
        return

    script_dir = Path(__file__).parent
    source_file = script_dir / args.source
    locales_dir = source_file.parent

    if not source_file.exists():
        print(f"❌ Source not found: {source_file}")
        return

    progress = create_progress_file(locales_dir)
    if args.reset and args.lang in progress:
        progress[args.lang] = _default_lang_progress()
        save_progress(locales_dir, progress)
        print(f"✅ Progress reset for {args.lang}")

    print(f"📖 Loading source: {source_file}")
    source_data = load_json(source_file)

    if args.lang not in LANGUAGE_NAMES:
        print(f"❌ Unknown language: {args.lang}")
        print(f"   Known: {', '.join(LANGUAGE_NAMES)}")
        return

    languages = {args.lang: LANGUAGE_NAMES[args.lang]}

    print(f"\n🌐 DeepL Batch Translation")
    print(f"📦 Batch size: {args.batch_size}")
    print(f"🔄 Batches per run: {args.batches_per_run}\n")

    for lang_code, lang_name in languages.items():
        target_file = locales_dir / f"{lang_code}.json"
        print(f"{'=' * 70}")
        print(f"🌐 {lang_name.upper()} ({lang_code})")
        print(f"{'=' * 70}")

        if progress[lang_code].get("completed"):
            # Re-check for new missing keys
            existing = load_json(target_file) if target_file.exists() else {}
            if not collect_missing_keys(source_data, existing):
                print("  ✅ Already completed! Skipping...")
                continue
            progress[lang_code] = _default_lang_progress()

        target_data = load_json(target_file) if target_file.exists() else {}
        missing = collect_missing_keys(source_data, target_data)

        if not missing:
            print("  ✅ No missing keys!")
            progress[lang_code]["completed"] = True
            save_progress(locales_dir, progress)
            continue

        missing_list = list(missing.items())
        total_keys = len(missing_list)
        total_batches = (total_keys + args.batch_size - 1) // args.batch_size
        progress[lang_code]["total_batches"] = total_batches
        save_progress(locales_dir, progress)

        completed_batches = progress[lang_code]["completed_batches"]
        print(f"  📊 Keys to translate: {total_keys:,}")
        print(f"  📦 Batches: {completed_batches}/{total_batches}\n")

        start_batch = completed_batches
        end_batch = min(completed_batches + args.batches_per_run, total_batches)
        translated_all = {}

        for batch_idx in range(start_batch, end_batch):
            batch_start = batch_idx * args.batch_size
            batch_end = min(batch_start + args.batch_size, total_keys)
            batch = dict(missing_list[batch_start:batch_end])
            print(f"  📦 Batch {batch_idx + 1}/{total_batches} ({len(batch)} keys)...", end=" ", flush=True)

            try:
                keys = list(batch.keys())
                texts = list(batch.values())
                translated_texts = translate_batch_with_deepl(
                    texts, LANGUAGE_CODES[lang_code], api_key
                )
                for key, translated in zip(keys, translated_texts):
                    translated_all[key] = translated
                progress[lang_code]["completed_batches"] = batch_idx + 1
                save_progress(locales_dir, progress)
                print("✅")
                if batch_idx < end_batch - 1:
                    time.sleep(0.5)
            except Exception as e:
                print(f"❌ Error: {e}")
                print(f"  ⚠️  Progress saved. Re-run to continue.")
                break

        if translated_all:
            target_data = merge_dicts(target_data, translated_all)
            save_json(target_file, target_data)
            print(f"\n  ✅ Saved {len(translated_all)} translations → {target_file}")

            if progress[lang_code]["completed_batches"] >= total_batches:
                progress[lang_code]["completed"] = True
                save_progress(locales_dir, progress)
                print(f"  🎉 {lang_name} translation COMPLETE!")
            else:
                remaining = total_batches - progress[lang_code]["completed_batches"]
                print(f"  ⏳ {remaining} batches remaining. Run again to continue.")

    print(f"\n{'=' * 70}")
    print("📊 DONE")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
