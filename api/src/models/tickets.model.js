const mongoose = require('mongoose');

const statusCommentSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'declined'],
  },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const registrationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    firstName: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    contactNumber: { type: String, default: '' },
    conference: {
      type: String,
      required: true,
      enum: ['cc-western', 'cc-northern', 'cc-eastern', 'cape', 'ncsa', 'other'],
    },
    churchOrOrganization: { type: String, default: '' },
    churchInsured: { type: String, default: 'true' },
    gender: { type: String, required: true, enum: ['male', 'female'] },
    age: { type: Number, min: 1, max: 120 },
    delegateType: { type: String, default: '', enum: ['', 'ambassador', 'youthAdult'] },
    emergencyContactName: { type: String, default: '' },
    emergencyContactNumber: { type: String, default: '' },
    package: {
      type: String,
      required: true,
      default: 'basicPack',
      enum: ['basic', 'basicPack', 'halfPack', 'fullPack', 'withPack', 'withoutPack'],
    },
    hoodieSize: {
      type: String,
      enum: ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
      required: function () {
        return ['withPack', 'basicPack', 'halfPack', 'fullPack'].includes(this.package);
      },
    },
    passportPhoto: { type: String, default: '' },
    paymentProof: { type: String, default: '' },
    ticketId: { type: String, required: true, unique: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
    },
    statusComments: [statusCommentSchema],
  },
  { timestamps: true }
);

registrationSchema.index({ email: 1, firstName: 1, surname: 1 });
registrationSchema.index({ status: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
