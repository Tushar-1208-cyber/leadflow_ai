const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Force Node to use Google DNS to bypass ISP SRV block
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const User = require('../models/user');
const Lead = require('../models/lead');
const Task = require('../models/task');
const Activity = require('../models/activity');
const Notification = require('../models/notification');
const Comment = require('../models/comment');

const usersData = [
  {
    name: 'Tushar Sharma',
    email: 'admin@leadflow.com',
    password: 'password123',
    role: 'admin',
    designation: 'Managing Director & Admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&fit=crop',
  },
  {
    name: 'Sarah Connor',
    email: 'leader@leadflow.com',
    password: 'password123',
    role: 'team-leader',
    designation: 'Sales & BDA Team Leader',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop',
  },
  {
    name: 'Alex Mercer',
    email: 'bda@leadflow.com',
    password: 'password123',
    role: 'bda-employee',
    designation: 'Senior BDA Associate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop',
    activeLeads: 4,
    dealsClosed: 3,
    revenueGenerated: 165000,
    tasksAssigned: 3,
    productivityScore: 88,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/leadflow-ai');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Lead.deleteMany();
    await Task.deleteMany();
    await Activity.deleteMany();
    await Notification.deleteMany();
    await Comment.deleteMany();
    console.log('Cleared existing collection entries.');

    // 1. Create Users
    const users = await User.create(usersData);
    console.log('Seeded Users successfully.');

    const admin = users[0];
    const leader = users[1];
    const bda = users[2];

    // 2. Create Leads
    const leadsData = [
      {
        leadName: 'John Miller',
        companyName: 'Apex Steel Industries',
        industry: 'Heavy Metallurgy',
        email: 'jmiller@apexsteel.com',
        phone: '+1 (555) 019-2834',
        status: 'Negotiation',
        priority: 'High',
        assignedTo: bda._id,
        dealAmount: 85000,
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
        notes: 'Requested customized alloy pricing. Highly interested in bulk structural steel pillars. Finalizing contract terms.',
        history: [
          { action: 'Lead Created', performedBy: 'Sarah Connor' },
          { action: 'Status updated from New to Contacted', performedBy: 'Alex Mercer' },
          { action: 'Status updated from Contacted to Proposal Sent', performedBy: 'Alex Mercer' },
          { action: 'Status updated from Proposal Sent to Negotiation', performedBy: 'Alex Mercer' },
        ],
      },
      {
        leadName: 'Elena Rostova',
        companyName: 'Kirov Automotive Systems',
        industry: 'Automotive Parts',
        email: 'erostova@kirovauto.com',
        phone: '+1 (555) 014-9844',
        status: 'Won',
        priority: 'High',
        assignedTo: bda._id,
        dealAmount: 120000,
        followUpDate: null,
        notes: 'Contract signed for 50 custom chassis assemblies. Invoice dispatched. Closed successfully!',
        history: [
          { action: 'Lead Created', performedBy: 'Sarah Connor' },
          { action: 'Status updated from New to Proposal Sent', performedBy: 'Alex Mercer' },
          { action: 'Status updated from Proposal Sent to Won', performedBy: 'Alex Mercer' },
        ],
      },
      {
        leadName: 'Marcus Aurelius',
        companyName: 'Vanguard Solar Components',
        industry: 'Green Energy',
        email: 'marcus@vanguardsolar.com',
        phone: '+1 (555) 012-4433',
        status: 'Proposal Sent',
        priority: 'High',
        assignedTo: bda._id,
        dealAmount: 45000,
        followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        notes: 'Submitted proposal for smart automated solar panel brackets. Needs feedback on scaling discounts.',
        history: [
          { action: 'Lead Created', performedBy: 'Sarah Connor' },
          { action: 'Status updated from New to Contacted', performedBy: 'Alex Mercer' },
          { action: 'Status updated from Contacted to Proposal Sent', performedBy: 'Alex Mercer' },
        ],
      },
      {
        leadName: 'David Lee',
        companyName: 'Pacifica Casting Works',
        industry: 'Heavy Metallurgy',
        email: 'dlee@pacificacasting.com',
        phone: '+1 (555) 017-7788',
        status: 'Interested',
        priority: 'Medium',
        assignedTo: bda._id,
        dealAmount: 32000,
        followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        notes: 'Presented automated casting conveyor plans. BDA sent follow-up catalog. The buyer is examining specifications.',
        history: [
          { action: 'Lead Created', performedBy: 'Sarah Connor' },
          { action: 'Status updated from New to Contacted', performedBy: 'Alex Mercer' },
          { action: 'Status updated from Contacted to Interested', performedBy: 'Alex Mercer' },
        ],
      },
      {
        leadName: 'Robert Baratheon',
        companyName: 'Storms End Heavy Machinery',
        industry: 'Industrial Equipment',
        email: 'bobbyb@stormsend.com',
        phone: '+1 (555) 011-8899',
        status: 'New',
        priority: 'Low',
        assignedTo: bda._id,
        dealAmount: 18000,
        notes: 'Inbound lead regarding turbine shaft milling. Uncontacted yet.',
        history: [
          { action: 'Lead Created', performedBy: ' Sarah Connor' },
        ],
      },
      {
        leadName: 'Tony Stark',
        companyName: 'Stark Arc Reactor Supplies',
        industry: 'Advanced Aerospace',
        email: 'tony@stark.com',
        phone: '+1 (555) 300-3000',
        status: 'Won',
        priority: 'High',
        assignedTo: bda._id,
        dealAmount: 45000,
        notes: 'Secured high-grade titanium casing procurement. Transaction completed.',
        history: [
          { action: 'Lead Created', performedBy: ' Sarah Connor' },
          { action: 'Status updated from New to Won', performedBy: 'Alex Mercer' },
        ],
      },
      {
        leadName: 'Bruce Wayne',
        companyName: 'Wayne Enterprises Manufacturing',
        industry: 'Defense Materials',
        email: 'bruce@waynecorp.com',
        phone: '+1 (555) 911-0000',
        status: 'Lost',
        priority: 'High',
        assignedTo: bda._id,
        dealAmount: 250000,
        notes: 'Lost to internal Gotham competitor offering quicker lead time. BDA to follow up next fiscal quarter.',
        history: [
          { action: 'Lead Created', performedBy: 'Sarah Connor' },
          { action: 'Status updated from New to Negotiation', performedBy: 'Alex Mercer' },
          { action: 'Status updated from Negotiation to Lost', performedBy: 'Alex Mercer' },
        ],
      },
      {
        leadName: 'Clarissa Harlowe',
        companyName: 'Lumina Glasswork Inc',
        industry: 'Glass Fabrication',
        email: 'clarissa@luminaglass.com',
        phone: '+1 (555) 016-1212',
        status: 'Contacted',
        priority: 'Medium',
        assignedTo: leader._id,
        dealAmount: 27000,
        followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        notes: 'Spoke with Procurement Director. Set up video call next Wednesday to inspect high-temp furnace bricking options.',
        history: [
          { action: 'Lead Created', performedBy: 'Sarah Connor' },
          { action: 'Status updated from New to Contacted', performedBy: 'Sarah Connor' },
        ],
      },
      {
        leadName: 'Victor Frankenstein',
        companyName: 'Geneva Bio-Medical Machinery',
        industry: 'Medical Devices',
        email: 'victor@genevabiomed.com',
        phone: '+1 (555) 018-6666',
        status: 'New',
        priority: 'High',
        assignedTo: null, // Unassigned
        dealAmount: 72000,
        notes: 'Inbound request for advanced laboratory heating assemblies. High interest, requires urgent BDA allocation.',
        history: [
          { action: 'Lead Created', performedBy: 'Sarah Connor' },
        ],
      },
    ];

    const leads = await Lead.create(leadsData);
    console.log('Seeded Leads successfully.');

    // 3. Seed Comments
    await Comment.create([
      {
        leadId: leads[0]._id,
        author: bda._id,
        text: 'Spoke to their head engineer. They approved our technical specs, just reviewing financial terms.',
      },
      {
        leadId: leads[0]._id,
        author: leader._id,
        text: 'Excellent, Alex! Admin approved a 5% margin discount if they lock this contract before Friday.',
      },
    ]);
    console.log('Seeded Comments successfully.');

    // 4. Seed Tasks
    const tasksData = [
      {
        title: 'Review Apex Steel Contract Specs',
        description: 'Double check the customized pillars thickness parameters with our manufacturing engineer.',
        assignedTo: bda._id,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        priority: 'High',
        status: 'Pending',
      },
      {
        title: 'Call Vanguard Solar regarding proposal feedback',
        description: 'Ask Marcus about scaling discounts and if they need revisions to solar mount drawings.',
        assignedTo: bda._id,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'High',
        status: 'Pending',
      },
      {
        title: 'Draft proposal for Lumina Glassworks',
        description: 'Compile high-temperature insulation bricks inventory pricing quote.',
        assignedTo: leader._id,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        status: 'Pending',
      },
      {
        title: 'Verify Kirov Auto payment dispatch',
        description: 'Finance team sent receipt confirmation. Clear invoice log.',
        assignedTo: bda._id,
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        priority: 'Medium',
        status: 'Completed',
      },
    ];

    await Task.create(tasksData);
    console.log('Seeded Tasks successfully.');

    // 5. Seed Activities
    const activitiesData = [
      {
        action: 'Lead Created',
        details: 'Sarah Connor created lead for Geneva Bio-Medical Machinery',
        performedBy: leader._id,
        leadId: leads[8]._id,
      },
      {
        action: 'Lead Updated',
        details: 'Alex Mercer updated lead Apex Steel Industries (Negotiation)',
        performedBy: bda._id,
        leadId: leads[0]._id,
      },
      {
        action: 'Status Updated',
        details: 'Alex Mercer won deal Kirov Automotive Systems ($120,000)',
        performedBy: bda._id,
        leadId: leads[1]._id,
      },
      {
        action: 'Task Completed',
        details: 'Alex Mercer completed task "Verify Kirov Auto payment dispatch"',
        performedBy: bda._id,
      },
    ];

    await Activity.create(activitiesData);
    console.log('Seeded Activities successfully.');

    // 6. Seed Notifications
    await Notification.create([
      {
        recipient: bda._id,
        message: 'Sarah Connor assigned new lead "Vanguard Solar Components" to you.',
        type: 'assignment',
        isRead: false,
      },
      {
        recipient: bda._id,
        message: 'Upcoming Deadline Alert: "Review Apex Steel Contract Specs" is due tomorrow.',
        type: 'task-deadline',
        isRead: false,
      },
    ]);
    console.log('Seeded Notifications successfully.');

    console.log('Database Seeding finished completely!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database: ', err.message);
    process.exit(1);
  }
};

seedDB();
