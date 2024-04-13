type AddCourseInput = {
    courseName: string
    coursePrice: number
    courseDuration: number
    courseDurationLesson: number
}

type Course = {
    course_id: string
    course_name: string
    course_price: number
    course_duration: number
    course_duration_lesson: number
}

export {
    Course,
    AddCourseInput
}