const express = require('express');
const { FieldValue } = require('firebase-admin/firestore');

const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config'); // Ensure this is importing the Firestore instance
const { collection,query, addDoc, getDocs, doc, updateDoc ,where ,getDoc  } = require('firebase/firestore');

const app = express();
app.use(express.json());
app.use(cors());
app.post("/addTeacher", async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const teachersCollection = collection(db, 'teachers');
        const docRef = await addDoc(teachersCollection, data);
        res.send([{message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/addStudent", async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const studentsCollection = collection(db, 'students');
        const docRef = await addDoc(studentsCollection, data);
        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getStudents", async (req, res) => {
    try {
        const studentsCollection = collection(db, 'students');
        const studentSnapshot = await getDocs(studentsCollection);
        const studentsList = studentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.send({ message: "success", students: studentsList });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/addTeacher", async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const teachersCollection = collection(db, 'teachers');
        const docRef = await addDoc(teachersCollection, data);
        res.send([{message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getBooks", async (req, res) => {
    try {
        const booksCollection = collection(db, 'books');
        const bookSnapshot = await getDocs(booksCollection);
        const booksList = bookSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.send({ message: "success", books: booksList });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});

app.post("/addOutCome", async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const outComesCollection = collection(db, 'outCome');
        const docRef = await addDoc(outComesCollection, data);
        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});

app.post("/addIncome", async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const incomesCollection = collection(db, 'inCome');
        const docRef = await addDoc(incomesCollection, data);
        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/updateTeacherDues", async (req, res) => {
    const { groupId, teacherId, amount,studentID } = req.body;

    try {
        // Retrieve the teacher's percentage
        const teacherRef = collection(db, 'teachers');
        const qT = query(teacherRef, where('id', '==', teacherId));
        const teacherDoc = await getDocs(qT);
    

        if (!teacherDoc.exists()) {
            return res.status(404).send({ message: "Teacher not found" });
        }

        const teacherData = teacherDoc.data();
        const percentage = teacherData.percentage;
        // Retrieve the group's price
        const groupRef = collection(db, 'groups');
       const  qG = query(groupRef, where('id', '==', groupId));
        const groupDoc = await getDoc(qG);
        

        if (!groupDoc.exists()) {
            return res.status(404).send({ message: "Group not found" });
        }

        const groupData = groupDoc.data();
        const price = groupData.price;

        // Calculate earnings
        const earnings = (percentage / 100) * price;

        // Update the teacher's dues
        const updatedDues = teacherData.dues + earnings;
        await updateDoc(teacherRef, { dues: updatedDues });
        // Record the remaining amount in income collection
        const remainingAmount = amount - earnings;
        await db.collection('income').add({
            type: "studentIncomes",
            by : studentID,
            amount: remainingAmount,
            date: admin.firestore.FieldValue.serverTimestamp()
        });

        res.send({ message: "Success", teacherId });
    } catch (error) {
        console.error("Error updating dues: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});


app.get("/getTeachers", async (req, res) => {
    try {
        // Fetch all teachers
        const teachersSnapshot = await getDocs(collection(db, 'teachers'));
        const teachers = teachersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch all groupes
        const groupesSnapshot = await getDocs(collection(db, 'groupes'));
        const groupesData = groupesSnapshot.docs.map(doc => doc.data());

        // Create a map to count groupes per teacherID
        const groupCounts = {};
        groupesData.forEach(groupe => {
            const teacherID = groupe.teacherID;
            if (teacherID) {
                groupCounts[teacherID] = (groupCounts[teacherID] || 0) + 1;
            }
        });

        // Add groupeCount to each teacher
        const teachersWithCount = teachers.map(teacher => ({
            ...teacher,
            groupeCount: groupCounts[teacher.id] || 0 // Default to 0 if no groupes
        }));
        console.log(teachersWithCount)
        res.send({ 
            message: "success", 
            teachers: teachersWithCount 
        });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getGroups", async (req, res) => {
    try {
        // Fetch all groupes
        const groupesSnapshot = await getDocs(collection(db, 'groupes'));
        const groupes = groupesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Fetch all students in groupes
        const studentsInGroupSnapshot = await getDocs(collection(db, 'studentsInGroup'));
        const studentsInGroupData = studentsInGroupSnapshot.docs.map(doc => doc.data());

        // Create a map to count students per groupID
        const groupCounts = {};
        studentsInGroupData.forEach(student => {
            const groupID = student.groupID;
            if (groupID) {
                groupCounts[groupID] = (groupCounts[groupID] || 0) + 1;
            }
        });

        // Add enrolledStudentNumber to each groupe
        const groupesWithCount = groupes.map(group => ({
            ...group,
            enrolledStudentNumber: groupCounts[group.id] || 0 // Default to 0 if no students
        }));

        console.log(groupesWithCount);
        res.send({ 
            message: "success", 
            groupes: groupesWithCount 
        });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getStudents", async (req, res) => {
    try {
        const studentsCollection = collection(db, 'students');
        const studentSnapshot = await getDocs(studentsCollection);
        console.log(studentsCollection)

        // Get all studentInGroup documents
        const groupCollection = collection(db, 'studentsInGroup');
        const groupSnapshot = await getDocs(groupCollection);

        // Count occurrences of each studentID in studentInGroup
        const groupCounts = {};
        groupSnapshot.docs.forEach(doc => {
            const studentID = doc.data().id; // Ensure field name matches your data
            if (studentID) {
                groupCounts[studentID] = (groupCounts[studentID] || 0) + 1;
            }
        });

        // Map students and include their group count
        const studentsList = studentSnapshot.docs.map(doc => {
            const studentData = doc.data();
            return {
                id: doc.id,
                ...studentData,
                groupCount: groupCounts[doc.id] || 0 // Default to 0 if no groups
            };
        });
        console.log(studentsList)

        res.send({ message: "success", students: studentsList });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
//get Student
// Use this syntax with firebase-admin
app.get("/getStudent", async (req, res) => {
    try {
        const { studentID } = req.query;
        console.log(studentID);
        
        if (!studentID) {
            return res.status(400).send({ message: "StudentID is required" });
        }

        // Create a reference to the students collection
        const studentsRef = collection(db, 'students');
        
        // Create a query against the collection
        const q = query(studentsRef, where('id', '==', studentID));
        console.log(q);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Get the first matching document
        const docSnapshot = querySnapshot.docs[0];
        const studentData = docSnapshot.data();
        studentData.id = docSnapshot.id;

        res.send({ message: "success", student: studentData} );
    } catch (error) {
        console.error("Error retrieving student: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getTeacher", async (req, res) => {
    try {
        const { teacherID } = req.query;
        console.log(teacherID);
        
        if (!teacherID) {
            return res.status(400).send({ message: "TeacherID is required" });
        }

        // Create a reference to the teachers collection
        const teachersRef = collection(db, 'teachers');
        
        // Create a query against the collection
        const q = query(teachersRef, where('id', '==', teacherID));
        console.log(q);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ message: "Teacher not found" });
        }

        // Get the first matching document
        const docSnapshot = querySnapshot.docs[0];
        const teacherData = docSnapshot.data();
        teacherData.id = docSnapshot.id;

        res.send({ message: "success", teacher: teacherData });
    } catch (error) {
        console.error("Error retrieving teacher: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getTeacherGroupes", async (req, res) => {
    try {
        const { teacherID } = req.query;
        console.log(teacherID);
        
        if (!teacherID) {
            return res.status(400).send({ message: "TeacherID is required" });
        }

        // Create a reference to the groupes collection
        const groupesRef = collection(db, 'groupes');
        
        // Create a query against the collection to find groups by teacherID
        const q = query(groupesRef, where('teacherID', '==', teacherID));
        console.log(q);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ message: "No groups found for this teacher" });
        }

        // Collect all matching documents
        const groupes = querySnapshot.docs.map(doc => {
            const groupeData = doc.data();
            groupeData.id = doc.id; // Add the document ID to the data
            return groupeData;
        });

        res.send({ message: "success", groupes });
    } catch (error) {
        console.error("Error retrieving groupes: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getGroup", async (req, res) => {
    try {
        const { groupID } = req.query;
        console.log(groupID);
        
        if (!groupID) {
            return res.status(400).send({ message: "GroupID is required" });
        }

        // Create a reference to the groups collection
        const groupsRef = collection(db, 'groupes');
        
        // Create a query against the collection
        const q = query(groupsRef, where('id', '==', groupID));
        console.log(q);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ message: "Group not found" });
        }

        // Get the first matching document
        const docSnapshot = querySnapshot.docs[0];
        const groupData = docSnapshot.data();
        groupData.id = docSnapshot.id;

        res.send({ message: "success", group: groupData });
    } catch (error) {
        console.error("Error retrieving group: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getStudentsInGroup", async (req, res) => {
    try {
        const { groupID } = req.query;
        console.log(groupID);
        
        if (!groupID) {
            return res.status(400).send({ message: "GroupID is required" });
        }

        // Create a reference to the studentInGroup collection
        const studentInGroupRef = collection(db, 'studentInGroup');
        
        // Create a query to find students in the specified group
        const q = query(studentInGroupRef, where('groupID', '==', groupID));
        console.log(q);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ message: "No students found in this group" });
        }

        // Collect student IDs from the results
        const studentIDs = querySnapshot.docs.map(doc => doc.data().studentID);

        // Create a reference to the student collection
        const studentRef = collection(db, 'student');
        const studentPromises = studentIDs.map(studentID =>
            getDocs(query(studentRef, where('id', '==', studentID)))
        );

        // Wait for all student queries to resolve
        const studentSnapshots = await Promise.all(studentPromises);

        // Collect student names
        const students = studentSnapshots.map(snapshot => {
            if (!snapshot.empty) {
                const studentData = snapshot.docs[0].data();
                return `${studentData.firstName} and ${studentData.lastName}`;
            }
            return null; // No matching student found
        }).filter(name => name !== null); // Filter out null values

        res.send({ message: "success", students });
    } catch (error) {
        console.error("Error retrieving students: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
//get StudentGroup
app.get("/getStudentGroups", async (req, res) => {
    try {
        const { studentID } = req.query;
        
        if (!studentID) {
            return res.status(400).send({ message: "StudentID is required" });
        }

        // Get subscriptions for the specified student
        const subscriptionsRef = collection(db, 'subscriptions');
        const subscriptionsQuery = query(subscriptionsRef, where('studentID', '==', studentID));
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);

        // Map the subscription documents to a more readable format
        const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
            subscriptionID: doc.id,
            groupID: doc.data().groupID,
            startDate: doc.data().startDate // Adjust according to your field names
        }));

        // Check if there are subscriptions
        if (subscriptions.length === 0) {
            return res.send({ 
                message: "No subscriptions found", 
                groupes: [] 
            });
        }

        // Sort subscriptions by startDate to determine first and last
        subscriptions.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        // Get first and last subscription dates
        const firstSubscription = subscriptions[0];
        const lastSubscription = subscriptions[subscriptions.length - 1];

        // Fetch group names for the groupIDs
        const groupIDs = subscriptions.map(sub => sub.groupID);
        console.log(groupIDs);
        const groupsPromises = groupIDs.map(groupID => getDoc(doc(db, 'groupes', groupID)));
        const groupsDocs = await Promise.all(groupsPromises);
        
        const groupsMap = {};
        groupsDocs.forEach(groupDoc => {
            if (groupDoc.exists()) {
                console.log(groupDoc.id);
                groupsMap[groupDoc.id] = groupDoc.data().name; // Store name if needed for any purpose
            }
        });

        // Construct the response
        const groupes = subscriptions.map(sub => ({
            groupID: sub.groupID, // Show groupID instead of name
            startDate: sub.startDate,
            lastDate: sub === lastSubscription ? sub.startDate : null // Only set lastDate for the last subscription
        }));

        res.send({
            message: "success",
            groupes: groupes
        });
        
    } catch (error) {
        console.error("Error retrieving subscriptions: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getSubsForStudent", async (req, res) => {
    try {
        const { studentID } = req.query;
        
        if (!studentID) {
            return res.status(400).send({ message: "StudentID is required" });
        }

        // Get subscriptions for the specified student
        const subscriptionsRef = collection(db, 'subscriptions');
        const subscriptionsQuery = query(subscriptionsRef, where('studentID', '==', studentID));
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);

        // Map the subscription documents to a more readable format
        const subscriptions = subscriptionsSnapshot.docs.map(doc => ({
            subscriptionID: doc.id,
            groupID: doc.data().groupID,
            subscriptionStart: doc.data().startTime, // Adjust according to your field names
            // Add more fields as necessary
        }));

        res.send({ 
            message: "success", 
            subscriptions: subscriptions 
        });
        
    } catch (error) {
        console.error("Error retrieving subscriptions: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getAttendanceForStudent", async (req, res) => {
    try {
        const { studentID } = req.query;
        
        if (!studentID) {
            return res.status(400).send({ message: "StudentID is required" });
        }

        // Get attendance for the specified student
        const attendanceRef = collection(db, 'attendance');
        const attendanceQuery = query(attendanceRef, where('studentID', '==', studentID));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        // Map the attendance documents to a more readable format
        const attendanceRecords = attendanceSnapshot.docs.map(doc => ({
            attendanceID: doc.id,
            date: doc.data().date,
            groupName: doc.data().groupName, // Adjust according to your field names
            status: doc.data().status, // e.g., "present", "absent", etc.
            // Add more fields as necessary
        }));

        res.send({ 
            message: "success", 
            attendance: attendanceRecords 
        });
        
    } catch (error) {
        console.error("Error retrieving attendance: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getIncomes", async (req, res) => {
    try {
        const incomesCollection = collection(db, 'inCome');
        const incomesSnapshot = await getDocs(incomesCollection);
        const incomesList = incomesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(incomesList);

        res.send({ message: "success", incomes: incomesList });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getOutcomes", async (req, res) => {
    try {
        const outcomesCollection = collection(db, 'outCome');
        const outcomesSnapshot = await getDocs(outcomesCollection);
        const outcomesList = outcomesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(outcomesList);

        res.send({ message: "success", outcomes: outcomesList });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/addGroup", async (req, res) => {
    const data = req.body;
    console.log(data);
    
    try {
        const groupsCollection = collection(db, 'groupes');
        
        // Extract teacherID and groupCount from data
        const { teacherID, groupCount, ...groupData } = data;

        // Add the group data (excluding teacherID and groupCount) to the 'groupes' collection
        const docRef = await addDoc(groupsCollection, groupData);
        
        // Query the 'teachers' collection to find the document where the 'id' field matches teacherID
        const teachersCollection = collection(db, 'teachers');
        const q = query(teachersCollection, where('id', '==', teacherID));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error(`Teacher with ID ${teacherID} not found.`);
        }

        // Get the first document that matches the query (assuming 'id' is unique)
        const teacherDocRef = querySnapshot.docs[0].ref;

        // Update the teacher's document in the 'teachers' collection
        await updateDoc(teacherDocRef, {
            groupCount: groupCount  // Use FieldValue.increment to increment groupCount by 1
        });

        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
// Route to add a trip
app.post("/addTrip", async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const tripsCollection = collection(db, 'trips');
        const docRef = await addDoc(tripsCollection, data);
        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});

// Route to get all trips
app.get("/getTrips", async (req, res) => {
    try {
        const tripsCollection = collection(db, 'trips');
        const tripSnapshot = await getDocs(tripsCollection);
        const tripsList = tripSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.send({ message: "success", trips: tripsList });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getTrip", async (req, res) => {
    const { tripID } = req.query; // Use req.query to access query parameters
    console.log(`Fetching trips with ID: ${tripID}`);
    
    try {
        const tripsCollection = collection(db, 'trips');
        const tripQuery = query(tripsCollection, where("tripID", "==", tripID));
        const tripSnapshot = await getDocs(tripQuery);

        if (tripSnapshot.empty) {
            return res.status(404).send({ message: "No trips found with the specified tripID" });
        }

        const tripsData = tripSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.send({ message: "success", trips: tripsData });
    } catch (error) {
        console.error("Error retrieving trips: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getStudentsInTrip", async (req, res) => {
    const { tripID } = req.query; // Use req.query instead of req.params
    console.log(`Fetching students for trip with ID: ${tripID}`);

    if (!tripID) {
        return res.status(400).send({ message: "Trip ID is required" });
    }

    try {
        // Query the collection for documents where tripID matches the provided tripID
        const studentsRef = collection(db, 'studentsInTrip');
        const q = query(studentsRef, where("tripID", "==", tripID));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ message: "No students found for this trip" });
        }

        const studentsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.send({ message: "success", students: studentsData });
    } catch (error) {
        console.error("Error retrieving students: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/addPresentStudent",async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const attendanceCollection = collection(db, 'attendance');
        const docRef = await addDoc(attendanceCollection, data);
        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getActiveSubscriptions", async (req, res) => {
    try {
        const subscriptionsCollection = collection(db, 'subscriptions');
        const subscriptionSnapshot = await getDocs(subscriptionsCollection);
        const today = new Date();
        const activeSubscriptionsList = subscriptionSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(subscription => {
                const startDay = new Date(subscription.startDay);
                const endDay = new Date(subscription.endDay);
                return today >= startDay && today <= endDay;
            });
        res.send({ message: "success", activeSubscriptions: activeSubscriptionsList });
    } catch (error) {
        console.error("Error retrieving documents: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/updateAllowances", async (req, res) => {
    const { studentID, allowancesTimesLeft } = req.body; // Expecting a JSON body with studentID and newValue

    if (!studentID || allowancesTimesLeft === undefined) {
        return res.status(400).send({ message: "studentID and newValue are required" });
    }

    try {
        const studentDocRef = doc(db, 'students', studentID);
        await updateDoc(studentDocRef, {
            allowancesTimesLeft: allowancesTimesLeft
        });

        res.send({ message: "success" });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/addSubscription", async (req, res) => {
    const data = req.body;
    console.log(data);
    
    try {
        const subscriptionsCollection = collection(db, 'subscriptions');
        const docRef = await addDoc(subscriptionsCollection, data);
        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/updateStudentDebt", async (req, res) => {
    const { id, debt } = req.body; // Expecting a JSON body with id and newDebt

    if (!id || debt === undefined) {
        return res.status(400).send({ message: "id and newDebt are required" });
    }

    try {
        // Query to find the student document with the specified id
        const studentsCollection = collection(db, 'students');
        const studentQuery = query(studentsCollection, where("id", "==", id));
        const studentSnapshot = await getDocs(studentQuery);
        
        if (studentSnapshot.empty) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Update the debt for the found student
        const studentDocRef = doc(db, 'students', studentSnapshot.docs[0].id);
        await updateDoc(studentDocRef, {
            debt: debt
        });

        res.send({ message: "success" });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});

app.post("/payDebt", async (req, res) => {
    const { id, debt ,allowancesTimesLeft } = req.body; // Expecting a JSON body with id and newDebt

    if (!id || debt === undefined) {
        return res.status(400).send({ message: "id and newDebt are required" });
    }

    try {
        // Query to find the student document with the specified id
        const studentsCollection = collection(db, 'students');
        const studentQuery = query(studentsCollection, where("id", "==", id));
        const studentSnapshot = await getDocs(studentQuery);
        
        if (studentSnapshot.empty) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Update the debt for the found student
        const studentDocRef = doc(db, 'students', studentSnapshot.docs[0].id);
        await updateDoc(studentDocRef, {
            debt: debt,
            allowancesTimesLeft:allowancesTimesLeft
        });

        res.send({ message: "success" });
    } catch (error) {
        console.error("Error updating document: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/addStudentToTrip", async (req, res) => {
    const { enrollDate, studentName, tripID, totalStudents } = req.body;
    console.log(req.body);
    
    try {
        const studentsInTripCollection = collection(db, 'studentsInTrip');
        const tripsCollection = collection(db, 'trips');

        // Add the student to the studentsInTrip collection
        await addDoc(studentsInTripCollection, { enrollDate, studentName, tripID });

        // Query for the trip document using the tripID field
        const tripQuery = query(tripsCollection, where("tripID", "==", tripID));
        const tripSnapshot = await getDocs(tripQuery);

        if (tripSnapshot.empty) {
            return res.status(404).send({ message: "Trip not found", tripID });
        }

        // Assuming there's only one document with the matching tripID
        const tripDocRef = doc(db, 'trips', tripSnapshot.docs[0].id);

        // Update the totalStudents in the trips collection with the new total
        await updateDoc(tripDocRef, {
            totalStudents: totalStudents 
        });
        
        res.send([{ message: "success", tripID }]);
    } catch (error) {
        console.error("Error adding student to trip: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.post("/addStudentToGroup", async (req, res) => {
    const data = req.body;
    console.log(req.body);

    try {
        const studentsInGroupCollection = collection(db, 'studentsInGroup');
        // Destructure necessary fields from the incoming data
        const { studentID, groupID} = data;
        // Add the student to the studentsInGroup collection
        await addDoc(studentsInGroupCollection, {studentID, groupID });
        res.send([{ message: "success", id: docRef.id }]);
    } catch (error) {
        console.error("Error adding student to group: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getBook", async (req, res) => {
    try {
        const { bookID } = req.query;
        console.log(bookID);
        
        if (!bookID) {
            return res.status(400).send({ message: "BookID is required" });
        }

        // Create a reference to the books collection
        const booksRef = collection(db, 'books');
        
        // Create a query against the collection
        const q = query(booksRef, where('id', '==', bookID));
        console.log(q);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).send({ message: "Book not found" });
        }

        // Get the first matching document
        const docSnapshot = querySnapshot.docs[0];
        const bookData = docSnapshot.data();
        bookData.id = docSnapshot.id;

        res.send({ message: "success", book: bookData });
    } catch (error) {
        console.error("Error retrieving book: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.get("/getStudentsWithBook", async (req, res) => {
    try {
        const { bookID } = req.query;

        if (!bookID) {
            return res.status(400).send({ message: "BookID is required" });
        }

        // Reference to the studentsHasBooks collection
        const studentsHasBooksRef = collection(db, 'studentsHasBooks');

        // Query to find studentIDs with the specified bookID
        const q = query(studentsHasBooksRef, where('bookID', '==', bookID));
        const studentHasBooksSnapshot = await getDocs(q);

        if (studentHasBooksSnapshot.empty) {
            return res.status(404).send({ message: "No students found for this book" });
        }

        // Collect student IDs
        const studentIDs = studentHasBooksSnapshot.docs.map(doc => doc.data().studentID);

        // Reference to the students collection
        const studentsRef = collection(db, 'students');
        const studentsList = [];

        // Retrieve student details for each studentID
        for (const studentID of studentIDs) {
            const studentDoc = await getDoc(doc(studentsRef, studentID));
            if (studentDoc.exists()) {
                const studentData = studentDoc.data();
                studentsList.push(`${studentData.firstName} ${studentData.lastName}`);
            }
        }

        res.send({ message: "success", students: studentsList });
    } catch (error) {
        console.error("Error retrieving students: ", error);
        res.status(500).send({ message: "Error", error: error.message });
    }
});
app.listen(4000, () => console.log("Up & running on port 4000"));