// resetSimple.js
import mongoose from 'mongoose';

const resetDatabase = async () => {
    try {
        // Spécifiez le nom de votre base de données dans l'URL
        const conn = await mongoose.connect('mongodb://admin:password@localhost:27017', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        const db = conn.connection.db;
        
        // Obtenir la liste de toutes les collections
        const collections = await db.listCollections().toArray();
        
        for (let collection of collections) {
            const collectionName = collection.name;
            // Éviter les collections système
            if (!collectionName.startsWith('system.')) {
                await db.collection(collectionName).deleteMany({});
                console.log(`✓ Cleared: ${collectionName}`);
            }
        }

        console.log('✅ All collections cleared successfully');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

resetDatabase();