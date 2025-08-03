const express = require('express');
const { body, validationResult } = require('express-validator');
const { getOne, getMany, insertOne, updateOne, deleteOne } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();


function convertQuery(query, params) {
  let convertedQuery = query;
  let convertedParams = [...params];
  
  
  if (process.env.DB_TYPE === 'postgres') {
    let paramIndex = 1;
    convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  }
  
  return { query: convertedQuery, params: convertedParams };
}


router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        id, payment_type, card_brand, last_four_digits, cardholder_name,
        expiry_month, expiry_year, billing_city, billing_state, billing_country,
        is_default, is_active, created_at
      FROM user_payment_methods 
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY is_default DESC, created_at DESC
    `;

    const { query: convertedQuery, params: convertedParams } = convertQuery(query, [userId]);
    const paymentMethods = await getMany(convertedQuery, convertedParams);

    res.json({ payment_methods: paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error while fetching payment methods' });
  }
});


router.post('/', authenticateToken, [
  body('payment_type').isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
  body('card_brand').optional().trim().isLength({ min: 1, max: 20 }),
  body('last_four_digits').isLength({ min: 4, max: 4 }).matches(/^\d{4}$/),
  body('cardholder_name').trim().isLength({ min: 1, max: 255 }),
  body('expiry_month').isInt({ min: 1, max: 12 }),
  body('expiry_year').isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 }),
  body('billing_address_line1').optional().trim().isLength({ max: 255 }),
  body('billing_city').optional().trim().isLength({ max: 100 }),
  body('billing_state').optional().trim().isLength({ max: 50 }),
  body('billing_postal_code').optional().trim().isLength({ max: 20 }),
  body('billing_country').optional().isLength({ min: 2, max: 3 }),
  body('is_default').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      payment_type,
      card_brand,
      last_four_digits,
      cardholder_name,
      expiry_month,
      expiry_year,
      billing_address_line1,
      billing_address_line2,
      billing_city,
      billing_state,
      billing_postal_code,
      billing_country = 'USA',
      is_default = false,
      stripe_payment_method_id
    } = req.body;

    
    if (is_default) {
      await updateOne('user_payment_methods', 
        { is_default: false }, 
        'user_id = ? AND is_default = TRUE', 
        [userId]
      );
    }

    const paymentMethodData = {
      user_id: userId,
      payment_type,
      card_brand: card_brand || null,
      last_four_digits,
      cardholder_name,
      expiry_month,
      expiry_year,
      billing_address_line1: billing_address_line1 || null,
      billing_address_line2: billing_address_line2 || null,
      billing_city: billing_city || null,
      billing_state: billing_state || null,
      billing_postal_code: billing_postal_code || null,
      billing_country,
      is_default,
      stripe_payment_method_id: stripe_payment_method_id || null
    };

    const paymentMethodId = await insertOne('user_payment_methods', paymentMethodData);

    res.status(201).json({
      message: 'Payment method added successfully',
      payment_method_id: paymentMethodId
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ message: 'Server error while adding payment method' });
  }
});


router.put('/:id', authenticateToken, [
  body('cardholder_name').optional().trim().isLength({ min: 1, max: 255 }),
  body('expiry_month').optional().isInt({ min: 1, max: 12 }),
  body('expiry_year').optional().isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 }),
  body('billing_address_line1').optional().trim().isLength({ max: 255 }),
  body('billing_city').optional().trim().isLength({ max: 100 }),
  body('billing_state').optional().trim().isLength({ max: 50 }),
  body('billing_postal_code').optional().trim().isLength({ max: 20 }),
  body('billing_country').optional().isLength({ min: 2, max: 3 }),
  body('is_default').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const paymentMethodId = req.params.id;

    
    const paymentMethod = await getOne(
      'SELECT id FROM user_payment_methods WHERE id = ? AND user_id = ?',
      [paymentMethodId, userId]
    );

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const allowedFields = [
      'cardholder_name', 'expiry_month', 'expiry_year',
      'billing_address_line1', 'billing_address_line2',
      'billing_city', 'billing_state', 'billing_postal_code',
      'billing_country', 'is_default'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    
    if (updateData.is_default === true) {
      await updateOne('user_payment_methods', 
        { is_default: false }, 
        'user_id = ? AND is_default = TRUE AND id != ?', 
        [userId, paymentMethodId]
      );
    }

    await updateOne('user_payment_methods', updateData, 'id = ?', [paymentMethodId]);

    res.json({ message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ message: 'Server error while updating payment method' });
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethodId = req.params.id;

    
    const paymentMethod = await getOne(
      'SELECT id, is_default FROM user_payment_methods WHERE id = ? AND user_id = ?',
      [paymentMethodId, userId]
    );

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    
    const activeSubscription = await getOne(`
      SELECT us.id FROM user_subscriptions us
      JOIN user_payment_methods upm ON us.payment_method = CONCAT(upm.card_brand, ' ****', upm.last_four_digits)
      WHERE upm.id = ? AND us.user_id = ? AND us.status = 'active' AND us.expires_at > NOW()
    `, [paymentMethodId, userId]);

    if (activeSubscription) {
      return res.status(400).json({ 
        message: 'Cannot delete payment method that is used by an active subscription' 
      });
    }

    
    await updateOne('user_payment_methods', 
      { is_active: false }, 
      'id = ?', 
      [paymentMethodId]
    );

    
    if (paymentMethod.is_default) {
      const otherPaymentMethod = await getOne(`
        SELECT id FROM user_payment_methods 
        WHERE user_id = ? AND is_active = TRUE AND id != ?
        ORDER BY created_at DESC LIMIT 1
      `, [userId, paymentMethodId]);

      if (otherPaymentMethod) {
        await updateOne('user_payment_methods', 
          { is_default: true }, 
          'id = ?', 
          [otherPaymentMethod.id]
        );
      }
    }

    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ message: 'Server error while deleting payment method' });
  }
});


router.put('/:id/set-default', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentMethodId = req.params.id;

    
    const paymentMethod = await getOne(
      'SELECT id FROM user_payment_methods WHERE id = ? AND user_id = ? AND is_active = TRUE',
      [paymentMethodId, userId]
    );

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    
    await updateOne('user_payment_methods', 
      { is_default: false }, 
      'user_id = ? AND is_default = TRUE', 
      [userId]
    );

    
    await updateOne('user_payment_methods', 
      { is_default: true }, 
      'id = ?', 
      [paymentMethodId]
    );

    res.json({ message: 'Default payment method updated successfully' });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({ message: 'Server error while setting default payment method' });
  }
});


router.get('/billing-addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await getMany(`
      SELECT id, address_name, address_line1, address_line2, city, state,
             postal_code, country, is_default, created_at
      FROM user_billing_addresses 
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    res.json({ billing_addresses: addresses });
  } catch (error) {
    console.error('Get billing addresses error:', error);
    res.status(500).json({ message: 'Server error while fetching billing addresses' });
  }
});


router.post('/billing-addresses', authenticateToken, [
  body('address_name').optional().trim().isLength({ max: 100 }),
  body('address_line1').trim().isLength({ min: 1, max: 255 }),
  body('address_line2').optional().trim().isLength({ max: 255 }),
  body('city').trim().isLength({ min: 1, max: 100 }),
  body('state').trim().isLength({ min: 1, max: 50 }),
  body('postal_code').trim().isLength({ min: 1, max: 20 }),
  body('country').optional().isLength({ min: 2, max: 3 }),
  body('is_default').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      address_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country = 'USA',
      is_default = false
    } = req.body;

    
    if (is_default) {
      await updateOne('user_billing_addresses', 
        { is_default: false }, 
        'user_id = ? AND is_default = TRUE', 
        [userId]
      );
    }

    const addressData = {
      user_id: userId,
      address_name: address_name || null,
      address_line1,
      address_line2: address_line2 || null,
      city,
      state,
      postal_code,
      country,
      is_default
    };

    const addressId = await insertOne('user_billing_addresses', addressData);

    res.status(201).json({
      message: 'Billing address added successfully',
      address_id: addressId
    });
  } catch (error) {
    console.error('Add billing address error:', error);
    res.status(500).json({ message: 'Server error while adding billing address' });
  }
});

module.exports = router;
