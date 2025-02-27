const Wallet = require('../../models/wallet');
const MainCategory = require('../../models/mainCategory');
const SubCategory = require('../../models/subCategory');


const walletController = {

   
    // Get wallet page with transactions
    getWallet: async (req, res) => {
        try {
            let wallet = await Wallet.findOne({ user: req.session.userId });
            
            if (!wallet) {
                wallet = await Wallet.create({
                    user: req.session.userId,
                    balance: 0,
                    transactions: []
                });
            }
            const categoriesWithSubs = await MainCategory.aggregate([
                {
                    $match: { status: 'active' }
                },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: '_id',
                        foreignField: 'mainCategory',
                        pipeline: [{ $match: { status: 'active' } }],
                        as: 'subcategories'
                    }
                }
            ]);
    
            // Only keep the last 10 transactions
            wallet.transactions = wallet.transactions.slice(-10);
    
            res.render('../views/pages/user/wallet', { wallet,categoriesWithSubs});
        } catch (error) {
            console.error('Error fetching wallet:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    
    // Get wallet balance
    getBalance: async (req, res) => {
        try {
            const wallet = await Wallet.findOne({ user: req.session.userId });
            
            if (!wallet) {
                return res.status(404).json({ message: 'Wallet not found' });
            }

            res.json({ balance: wallet.balance });
        } catch (error) {
            console.error('Error fetching balance:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = walletController;
