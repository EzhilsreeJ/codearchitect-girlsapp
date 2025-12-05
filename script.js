const { useState, useEffect } = React;

function App() {
    // Initial data for rooms
    const [rooms, setRooms] = useState([
        { number: '101', capacity: 2, currentOccupants: [] },
        { number: '102', capacity: 3, currentOccupants: [] },
        { number: '103', capacity: 2, currentOccupants: [] },
        { number: '201', capacity: 4, currentOccupants: [] },
    ]);

    // Initial data for students
    const [students, setStudents] = useState([]);

    // State for Add Student Form
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentId, setNewStudentId] = useState('');
    const [addStudentError, setAddStudentError] = useState('');

    // State for Assign Room Form
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
    const [assignRoomError, setAssignRoomError] = useState('');

    const handleAddStudent = (e) => {
        e.preventDefault();
        setAddStudentError('');

        if (!newStudentName.trim() || !newStudentId.trim()) {
            setAddStudentError('Student Name and ID cannot be empty.');
            return;
        }
        if (students.some(s => s.id === newStudentId)) {
            setAddStudentError('Student with this ID already exists.');
            return;
        }

        const newStudent = {
            id: newStudentId,
            name: newStudentName,
            roomNumber: null
        };
        setStudents([...students, newStudent]);
        setNewStudentName('');
        setNewStudentId('');
    };

    const handleAssignRoom = (e) => {
        e.preventDefault();
        setAssignRoomError('');

        if (!selectedStudentId || !selectedRoomNumber) {
            setAssignRoomError('Please select both a student and a room.');
            return;
        }

        const student = students.find(s => s.id === selectedStudentId);
        const room = rooms.find(r => r.number === selectedRoomNumber);

        if (!student) {
            setAssignRoomError('Student not found.');
            return;
        }
        if (!room) {
            setAssignRoomError('Room not found.');
            return;
        }

        if (student.roomNumber === selectedRoomNumber) {
            setAssignRoomError(`Student ${student.name} is already assigned to room ${selectedRoomNumber}.`);
            return;
        }

        if (room.currentOccupants.length >= room.capacity) {
            setAssignRoomError(`Room ${room.number} is full.`);
            return;
        }
        
        // If student is already in another room, unassign them first
        if (student.roomNumber && student.roomNumber !== selectedRoomNumber) {
            const prevRoom = rooms.find(r => r.number === student.roomNumber);
            if (prevRoom) {
                setRooms(prevRooms =>
                    prevRooms.map(r =>
                        r.number === prevRoom.number
                            ? { ...r, currentOccupants: r.currentOccupants.filter(sId => sId !== student.id) }
                            : r
                    )
                );
            }
        }

        // Assign student to the new room
        setStudents(prevStudents =>
            prevStudents.map(s =>
                s.id === selectedStudentId ? { ...s, roomNumber: selectedRoomNumber } : s
            )
        );

        setRooms(prevRooms =>
            prevRooms.map(r =>
                r.number === selectedRoomNumber
                    ? { ...r, currentOccupants: [...r.currentOccupants, selectedStudentId] }
                    : r
            )
        );

        setSelectedStudentId('');
        setSelectedRoomNumber('');
    };

    const unassignedStudents = students.filter(s => s.roomNumber === null);
    const assignedStudents = students.filter(s => s.roomNumber !== null);

    return (
        <div className="container">
            <h1>Girls Hostel Management System</h1>

            <div className="section">
                <h2>Add New Student</h2>
                <form onSubmit={handleAddStudent}>
                    <div className="form-group">
                        <label htmlFor="studentName">Student Name:</label>
                        <input
                            type="text"
                            id="studentName"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            placeholder="e.g., Alice Smith"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="studentId">Student ID:</label>
                        <input
                            type="text"
                            id="studentId"
                            value={newStudentId}
                            onChange={(e) => setNewStudentId(e.target.value)}
                            placeholder="e.g., GH001"
                            required
                        />
                    </div>
                    {addStudentError && <p className="error-message">{addStudentError}</p>}
                    <div className="form-group">
                        <button type="submit">Add Student</button>
                    </div>
                </form>
            </div>

            <div className="section">
                <h2>Assign Student to Room</h2>
                <form onSubmit={handleAssignRoom}>
                    <div className="form-group">
                        <label htmlFor="selectStudent">Select Student:</label>
                        <select
                            id="selectStudent"
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            required
                        >
                            <option value="">-- Select Student --</option>
                            {unassignedStudents.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.id})
                                </option>
                            ))}
                             {assignedStudents.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.id}) (Currently in {student.roomNumber})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="selectRoom">Select Room:</label>
                        <select
                            id="selectRoom"
                            value={selectedRoomNumber}
                            onChange={(e) => setSelectedRoomNumber(e.target.value)}
                            required
                        >
                            <option value="">-- Select Room --</option>
                            {rooms.map(room => (
                                <option
                                    key={room.number}
                                    value={room.number}
                                    disabled={room.currentOccupants.length >= room.capacity}
                                >
                                    Room {room.number} (Capacity: {room.capacity}, Occupied: {room.currentOccupants.length})
                                    {room.currentOccupants.length >= room.capacity ? ' (Full)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    {assignRoomError && <p className="error-message">{assignRoomError}</p>}
                    <div className="form-group">
                        <button type="submit">Assign Room</button>
                    </div>
                </form>
            </div>

            <div className="section list-container">
                <h2>All Students</h2>
                <ul>
                    {students.length === 0 ? (
                        <li>No students registered yet.</li>
                    ) : (
                        students.map(student => (
                            <li key={student.id} className={student.roomNumber ? 'occupied' : ''}>
                                <span>{student.name} ({student.id})</span>
                                <span>{student.roomNumber ? `Room: ${student.roomNumber}` : 'Unassigned'}</span>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <div className="section list-container">
                <h2>Rooms Overview</h2>
                <ul>
                    {rooms.map(room => (
                        <li key={room.number} className={room.currentOccupants.length === room.capacity ? 'occupied' : ''}>
                            <span>Room {room.number}</span>
                            <span>
                                Occupancy: {room.currentOccupants.length} / {room.capacity}
                                {room.currentOccupants.length > 0 &&
                                    ` (${room.currentOccupants.map(studentId => students.find(s => s.id === studentId)?.name || studentId).join(', ')})`}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
