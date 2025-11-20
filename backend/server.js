const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Seed sample events in development if none exist
const seedSampleEvents = async () => {
	if (process.env.NODE_ENV === 'production') return;
	try {
		const Event = require('./models/Event');
		const count = await Event.countDocuments();
		if (count === 0) {
			const samples = [
				{
					title: 'TechFest 2025 - Innovation Expo',
					description: 'A college-wide technology expo featuring workshops, start-up booths and keynote talks.',
					date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
					time: '10:00',
					venue: 'Main Auditorium',
					category: 'Exhibition',
					image: 'https://via.placeholder.com/900x400?text=TechFest+2025',
					timeline: [
						{ time: '10:00', activity: 'Opening Ceremony' },
						{ time: '11:00', activity: 'Keynote: Future of AI' },
						{ time: '14:00', activity: 'Workshops & Booths' }
					],
				},
				{
					title: 'Hackathon Arena - 48hr Challenge',
					description: 'Students form teams and build prototypes in 48 hours. Prizes for top 3 teams.',
					date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
					time: '09:00',
					venue: 'Innovation Lab',
					category: 'Competition',
					image: 'https://via.placeholder.com/900x400?text=Hackathon+Arena',
					timeline: [
						{ time: '09:00', activity: 'Kickoff & Team Formation' },
						{ time: '18:00', activity: 'Mentor Office Hours' },
						{ time: '09:00 (next day)', activity: 'Final Presentations' }
					],
				},
				{
					title: 'Cultural Night - Beats & Drama',
					description: 'An evening of music, dance and drama by student clubs.',
					date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
					time: '18:30',
					venue: 'Open Grounds',
					category: 'Cultural',
					image: 'https://via.placeholder.com/900x400?text=Cultural+Night',
					timeline: [
						{ time: '18:30', activity: 'Live Bands' },
						{ time: '20:00', activity: 'Dance Performances' },
						{ time: '21:30', activity: 'Drama Showcase' }
					],
				}
			];
			await Event.insertMany(samples);
			console.log('Inserted sample events for development');
		}
	} catch (err) {
		console.error('Error seeding events:', err.message || err);
	}
};

seedSampleEvents();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => res.send('College Event Management API'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
