import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
monthlyLimit: { type: Number, default: 10000 }
});


export default mongoose.model('User', userSchema);