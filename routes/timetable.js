const router = require('express').Router();
const _ = require('lodash');
const User = require('../models/User');
const Subject = require('../models/Subject');


const Timetable = require('../models/Timetable');

router.post('/', async (req, res) => {
    try {
        const newTimetable = new Timetable({
            teacher: req.body.teacher,
            subject: req.body.subject,
            classroomNumber: req.body.classroomNumber,
            hall: req.body.hall,
            week: req.body.week,
            dayOfTheWeek: req.body.dayOfTheWeek,
            classTime: req.body.classTime,
            type: req.body.type,
            group: req.body.group,
            course: req.body.course,
            groupPart: req.body.groupPart,
            additional: req.body.additional
        })

        await newTimetable.save();

        const newTimetableClass = await Timetable.findOne({
                _id: newTimetable._id
            })
            .populate({
                path: 'subject',
                select: 'name'
            })
        res.status(200).send(newTimetableClass);
    } catch (error) {
        res.status(500).send(error)
    }
});

router.post('/import', async (req, res) => {
    try {
        const teacherInfo = req.body.teacher.split(' ');
        const teacher = await User.findOne({
            firstName: teacherInfo[1],
            secondName: teacherInfo[0],
            thirdName: teacherInfo[2],
        });

        const subject = await Subject.findOne({
            name: req.body.subject
        });
        
        const newTimetable = new Timetable({
            teacher: teacher._id,
            subject: subject.id,
            classroomNumber: req.body.classroomNumber,
            hall: req.body.hall,
            week: req.body.week,
            dayOfTheWeek: req.body.dayOfTheWeek,
            classTime: req.body.classTime,
            type: req.body.type,
            group: req.body.group,
            course: req.body.course,
            groupPart: req.body.groupPart,
            additional: req.body.additional
        })

        await newTimetable.save();

        const newTimetableClass = await Timetable.findOne({
                _id: newTimetable._id
            })
            .populate({
                path: 'subject',
                select: 'name'
            })
        res.status(200).send(newTimetableClass);
    } catch (error) {
        console.log(error);
        
        res.status(500).send(error)
    }
});

router.get('/', (req, res) => {
    try {
        Timetable.find({
                course: req.query.course,
                group: req.query.group,
                $or: [{
                    groupPart: req.query.groupPart
                }, {
                    groupPart: 0
                }]
            })
            .populate({
                path: 'teacher',
                select: 'firstName secondName thirdName'
            })
            .populate({
                path: 'subject',
                select: 'name'
            })
            .then(data => {
                const timetable = _.chain(data)
                    .groupBy('week')
                    .map((value, key) => ({
                        week: +key,
                        dayOfTheWeek: _.groupBy(value, 'dayOfTheWeek')
                    }))
                    .value();
                timetable.map((item) => {
                    for (let i = 1; i < 7; i++) {
                        if (!item.dayOfTheWeek[i]) {
                            item.dayOfTheWeek[i] = {}
                        }
                    }
                })
                res.send(timetable);
            })

    } catch (error) {
        console.log(error);
    }
});

router.get('/teacher', (req, res) => {
    try {
        Timetable.find({
                teacher: req.query.teacher,
            })
            .populate({
                path: 'teacher',
                select: 'firstName secondName thirdName'
            })
            .populate({
                path: 'subject',
                select: 'name'
            })
            .then(data => {
                const timetable = _.chain(data)
                    .groupBy('week')
                    .map((value, key) => ({
                        week: +key,
                        dayOfTheWeek: _.groupBy(value, 'dayOfTheWeek')
                    }))
                    .value();
                timetable.map((item) => {
                    for (let i = 1; i < 7; i++) {
                        if (!item.dayOfTheWeek[i]) {
                            item.dayOfTheWeek[i] = {}
                        }
                    }
                })
                res.send(timetable);
            })

    } catch (error) {
        console.log(error);
    }
});

router.get('/additional', (req, res) => {
    try {
        Timetable.find({
                teacher: req.body.teacher,
                additional: true
            })
            .populate({
                path: 'subject',
                select: 'name'
            })
            .then(data => {
                let additionalClass = data.map(item => {
                    return {
                        teacher: item.teacher,
                        subject: item.subject.name,
                        classroomNumber: item.classroomNumber,
                        hall: item.hall,
                        week: item.week,
                        dayOfTheWeek: item.dayOfTheWeek,
                        classTime: item.classTime,
                        groups: item.groups
                    }
                })
                res.status(200).send(additionalClass)
            })
    } catch (error) {
        console.log(error);
    }
})

router.get('/day', (req, res) => {
    try {
        Timetable.find({
                course: req.query.course,
                group: req.query.group,
                week: req.query.week,
                dayOfTheWeek: req.query.dayOfTheWeek,
                $or: [{
                    groupPart: req.query.groupPart
                }, {
                    groupPart: 0
                }]
            })
            .sort({
                classTime: 1
            })
            .populate({
                path: 'teacher',
                select: 'firstName secondName thirdName'
            })
            .populate({
                path: 'subject',
                select: 'name'
            })
            .then(data => {
                res.send(data);
            })

    } catch (error) {
        console.log(error);
    }
})

router.get('/day/teacher', (req, res) => {
    try {
        Timetable.find({
                teacher: req.query.teacher,
                week: req.query.week,
                dayOfTheWeek: req.query.dayOfTheWeek,
            })
            .sort({
                classTime: 1
            })
            .populate({
                path: 'teacher',
                select: 'firstName secondName thirdName'
            })
            .populate({
                path: 'subject',
                select: 'name'
            })
            .then(data => {
                res.send(data);
            })

    } catch (error) {
        console.log(error);
    }
})

router.put('/', (req, res) => {
    Timetable.findOneAndUpdate({
        _id: req.body.timetableId
    }, {
        teacher: req.body.teacher,
        subject: req.body.subject,
        classroomNumber: req.body.classroomNumber,
        hall: req.body.hall,
        week: req.body.week,
        dayOfTheWeek: req.body.dayOfTheWeek,
        classTime: req.body.classTime,
        type: req.body.type,
        group: req.body.group,
        course: req.body.course,
        groupPart: req.body.groupPart,
        additional: req.body.additional
    }, {
        new: true
    }).then(data => {
        res.send(data)
    })
})

router.delete('/', (req, res) => {
    try {
        Timetable.deleteOne({
                _id: req.body.id
            })
            .then(data => {
                res.status(200).send(data)
            })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/clear', (req, res) => {
    try {
        Timetable.deleteMany({
                course: req.body.course
            })
            .then(data => {
                res.status(200).send(data)
            })
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;