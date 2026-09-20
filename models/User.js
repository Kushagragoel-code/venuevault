const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type    : String,
    required: [true, 'Name is required'],
    trim    : true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type    : String,
    required: [true, 'Email is required'],
    unique  : true,
    lowercase: true,
    match   : [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type    : String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type   : String,
    enum   : ['Organiser', 'Admin'],
    default: 'Organiser'
  }
}, { timestamps: true });

/* Hash password before every save */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* Instance method: compare plain password with hash */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
