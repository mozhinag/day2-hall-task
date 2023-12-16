const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hall Booking API");
})
let hall = [
    {
        roomName: "small",
        seats: 300,
        amenities: "wifi,projection screen,AC",
        price: 1000,
        roomId: "300-l",
        isBooked: true
    },
    {
        roomName: "large",
        seats: 500,
        amenities: "wifi,projection screen,AC",
        price: 1500,
        roomId: "400-xl",
        isBooked: true
    },
    {
        roomName: "extra-large",
        seats: 600,
        amenities: "wifi,projection screen,AC",
        price: 2000,
        roomId: "600-xl",
        isBooked: false
    }
];

let BookingDetails = [
    {
        customerName: "Ravi",
        date: "2023-11-14",
        start: "12:00 AM",
        end: "7:00 PM",
        roomId: "300-l",  
        status: "confirmed"
    },
    {
        customerName: "kamal",
        date: "2023-11-15",
        start: "9:00 AM",
        end: "10:59 PM",
        roomId: "400-xl",
        status: "confirmed"
    },
    {
        customerName: "Guru",
        date: "2023-11-14",
        start: "12:00 AM",
        end: "11:59 PM",
        roomId: "300-l",
        status: "confirmed"
    },
    {
        customerName: "Ravi",
        date: "2022-11-16",
        start: "12:00 AM",
        end: "11:59 PM",
        roomId: "400-xl",
        status: "confirmed"
    }
];
app.post('/createRoom', (req, res) => {
    try {
        const { roomName, seats, amenities, price, roomId } = req.body;

      
        const roomExists = hall.some(room => room.roomId === roomId);
        if (roomExists) {
            return res.status(400).json({ error: "Room with the same ID already exists" });
        }

       
        const newRoom = {
            roomName: req.body.roomName,
            seats: req.body.seats,
            amenities: req.body.amenities,
            price: req.body.price,
            roomId: req.body.roomId
        };

        hall.push(newRoom);

        res.status(201).json({ message: "Room created successfully", room: newRoom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post('/bookRoom', (req, res) => {
    try {
        const { customerName, date, start, end, roomId } = req.body;

        const room = hall.find(room => room.roomId === roomId);
        if (!room) {
            return res.status(400).json({ error: "Room not found" });
        }


        const conflictingBooking = BookingDetails.some(booking => {
            return (
                booking.roomId === roomId &&
                booking.date === date &&
                ((start >= booking.start && start <= booking.end) || (end >= booking.start && end <= booking.end))
            );
        });

        if (conflictingBooking) {
            return res.status(400).json({ error: "Booking conflict: Room already booked at this time" });
        }

        const newBooking = {
            customerName: req.body.customerName,
            date: req.body.date,
            start: req.body.start,
            end: req.body.end,
            roomId: req.body.roomId,
            status: "confirmed"
        };

        BookingDetails.push(newBooking);

        res.status(201).json({ message: "Booking created successfully", booking: newBooking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ...
app.get('/allRooms', (req, res) => {
    try {
       
        const roomsWithDetails = [];

        for (const room of hall) {
            const bookingForRoom = BookingDetails.find(booking => booking.roomId === room.roomId);

            roomsWithDetails.push({
                roomName: room.roomName,
                isBooked: !!bookingForRoom,
                customerName: bookingForRoom ? bookingForRoom.customerName : null,
                date: bookingForRoom ? bookingForRoom.date : null,
                start: bookingForRoom ? bookingForRoom.start : null,
                end: bookingForRoom ? bookingForRoom.end : null,
            });
        }

        res.status(200).json({ rooms: roomsWithDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/allCustomers', (req, res) => {
    try {

        const allCustomersDetails = BookingDetails.map(booking => {
            const room = hall.find(room => room.roomId === booking.roomId);
            return {
                customerName: booking.customerName,
                date: booking.date,
                start: booking.start,
                end: booking.end,
                roomId: booking.roomId,
                status: booking.status,
                roomDetails: room 
            };
        });

        res.status(200).json({ customersDetails: allCustomersDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/allRoomsAndCustomers', (req, res) => {
    try {
        const customerNameToCheck = "Ravi";

       
        const customerBookings = BookingDetails.filter(booking => (
            booking.customerName === customerNameToCheck
        ));

        const numberOfBookings = customerBookings.length;

  
        const customersWithRooms = customerBookings.map(booking => {
            const room = hall.find(room => room.roomId === booking.roomId);
            return {
                roomName: room.roomName, 
                isBooked: room.isBooked,
                customerName: booking.customerName,
                date: booking.date,
                start: booking.start,
                end: booking.end,
                roomDetails: room
            };
        });

        const result = { customers: customersWithRooms, numberOfBookings };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ...

app.listen(process.env.PORT || 3001);