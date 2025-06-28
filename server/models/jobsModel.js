import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Users" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  appliedDate: { type: Date, default: Date.now },
  resumeUrl: { type: String }, 
});

const jobSchema = new mongoose.Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Companies" },
    jobTitle: { type: String, required: [true, "Job Title is required"] },
    jobType: { type: String, required: [true, "Job Type is required"] },
    location: { type: String, required: [true, "Location is required"] },
    salary: { type: String, required: [true, "Salary is required"] },
    vacancies: { type: Number },
    experience: { type: Number, default: 0 },
    detail: [{ desc: { type: String }, requirements: { type: String } }],
    applications: [applicationSchema],
    skills: [{ type: String }],
    deadline: { type: Date, required: [true, "Application deadline is required"] },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

jobSchema.index({ 
  jobTitle: 'text', 
  skills: 'text',
  location: 'text',
  jobType: 1,
  salary: 1,
  experience: 1,
  deadline: 1,
  isArchived: 1,
  Expired : 1
});


jobSchema.pre('save', function(next) {
  if (!this.deadline) {
    this.deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  if (this.isModified('applications')) {
    this.applicationCount = this.applications.length;
  }
  next();
});

// middleware to check deadline and archive status
jobSchema.pre('find', function() {
    if (!this._conditions.showExpired) {
        this._conditions.deadline = { $gt: new Date() };
    }
    if (this._conditions.bypassArchiveFilter === true) {
        delete this._conditions.bypassArchiveFilter; 
        return; 
    }
    if (typeof this._conditions.isArchived === 'undefined') {
        this._conditions.isArchived = false;
    }
});

jobSchema.methods.isExpired = function() {
  return this.deadline && this.deadline < new Date();
};

const Jobs = mongoose.model("Jobs", jobSchema);

export default Jobs;