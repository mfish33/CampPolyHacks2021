export default interface User {
    userId:string
    name:string
    email:string
    bio:string
    personalInterests:string[],
    otherInterests:{
        [key:string]:number
    }
    pastUsersMet:string[]
    currentMeetings:string[]
}