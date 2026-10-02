/**
 * MongoDB Mongoose Schema definitions for Sidheswar Shree Jagannath Temple Backend.
 * These schemas represent the structure of the data collections stored in MongoDB.
 * You can copy this file directly to your Node.js/Express backend setup.
 */

// This file is mock-imported in frontend for design blueprint, 
// and contains standard Mongoose schemas.
const mockMongoose = {
  Schema: function(definition, options) {
    this.definition = definition;
    this.options = options;
  },
  model: function(name, schema) {
    return { name, schema };
  }
};

const Schema = mockMongoose.Schema;

// 1. User & Admin Schema
export const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Hashed password
  role: { 
    type: String, 
    enum: ['devotee', 'super_admin', 'content_editor', 'donation_manager', 'seva_manager', 'notice_manager'],
    default: 'devotee' 
  },
  gotra: { type: String, default: '' },
  address: { type: String, default: '' },
  notificationPreferences: {
    whatsapp: { type: Boolean, default: true },
    email: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

// 2. Seva Booking Schema
export const SevaBookingSchema = new Schema({
  userId: { type: String, default: null }, // Link if logged in
  devoteeName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gotra: { type: String, default: '' },
  address: { type: String, default: '' },
  familyMembers: [{ type: String }],
  selectedDate: { type: Date, required: true },
  sevaType: { type: String, required: true }, // e.g. "Annadan Seva"
  amount: { type: Number, required: true },
  specialRequest: { type: String, default: '' },
  bookingReference: { type: String, required: true, unique: true }, // Mapped to reference ID
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// 3. Donation / Digital Hundi Schema
export const DonationSchema = new Schema({
  userId: { type: String, default: null },
  donorName: { type: String, default: 'Anonymous' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['general_fund', 'daily_seva', 'anna_daan', 'festival_fund', 'construction_fund', 'cleanliness_fund', 'charity'], 
    required: true 
  },
  isAnonymous: { type: Boolean, default: false },
  paymentGateway: { type: String, default: 'UPI' },
  transactionId: { type: String, required: true, unique: true },
  receiptNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now }
});

// 4. News & Announcements Schema
export const NoticeSchema = new Schema({
  titleEn: { type: String, required: true },
  titleOr: { type: String, required: true },
  titleHi: { type: String, required: true },
  contentEn: { type: String, required: true },
  contentOr: { type: String, required: true },
  contentHi: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['urgent', 'general', 'festival', 'closure', 'parking', 'committee'], 
    default: 'general' 
  },
  pdfUrl: { type: String, default: '' }, // Path to downloadable notice
  publishDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  isPinned: { type: Boolean, default: false },
  createdBy: { type: String, required: true }, // Admin User ID
  createdAt: { type: Date, default: Date.now }
});

// 5. Festival Schema
export const FestivalSchema = new Schema({
  festivalNameEnglish: { type: String, required: true },
  festivalNameOdia: { type: String, required: true },
  festivalNameHindi: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['Major Festival', 'Jagannath Ritual', 'Local Temple Festival', 'Special Puja', 'Ekadashi / Purnima / Amavasya', 'Community Event'],
    required: true 
  },
  status: { type: String, enum: ['Confirmed', 'Tentative — subject to temple committee confirmation'], default: 'Tentative — subject to temple committee confirmation' },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  ritualSchedule: { type: String, default: '' },
  visitorGuidelines: { type: String, default: '' },
  parkingInformation: { type: String, default: '' },
  contactInformation: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// 6. Contact & Grievance Schema
export const ContactGrievanceSchema = new Schema({
  type: { type: String, enum: ['general_inquiry', 'feedback', 'grievance', 'lost_found', 'fraud_report'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  ticketNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// 7. Gallery Item Schema (Temple Photos Registry)
export const GallerySchema = new Schema({
  title: { type: String, required: true },
  altText: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Temple', 'Deities', 'Festivals', 'Rath Yatra', 'Bhoga/Prasad', 'Devotee Events', 'Old Photos'], 
    required: true 
  },
  imageUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  caption: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// 8. Audit Log Schema
export const AuditLogSchema = new Schema({
  adminId: { type: String, required: true },
  adminName: { type: String, required: true },
  role: { type: String, required: true },
  action: { type: String, required: true }, // e.g. "APPROVE_SEVA", "CREATE_NOTICE", "BACKUP_DB"
  description: { type: String, required: true },
  ipAddress: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});
