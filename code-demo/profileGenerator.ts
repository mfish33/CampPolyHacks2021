import faker from 'faker'
import User from './models/user'
import { v4 as uuidv4 } from 'uuid'

interface profileGeneratorConfig {
    numberProfiles:number,
    personalInterestsMin:number,
    personalInterestsMax:number,
    otherInterestsMax:number,
    otherInterestsMin:number,
    maxCategory:number,
    pastMeetings:number
}

const interests = [
    'Hiking',
    'Surfing',
    'Foodie',
    'Camping',
    'Painting',
    'Drawing',
    'Coding',
    'Skating',
    'Biking',
    'Board games',
    'Traveling',
    'Backpacking',
    'Beach’ing',
    'Golfing',
    'Basketball',
    'Reading (Bookworm)',
    'Video games',
    'Tennis',
    'Soccer',
    'Running',
    'Writing' ,
    'Dancing',
    'Netflix Junkie',
    'Cooking (Chef’ing)',
    'Fishing',
    'Yoga',
    'Bowling',
    'Mini golf',
    'Sunset Watching',
    'Bar hopping',
    'Thrifting',
    'Volunteering', 
    'Shopping',
    'Hammocking',
    'Faith',
    'Music Enthusiast',
    'Tech',
    'Sneakerhead',
    'Stonks',
    'Spikeball',
    'Slacklining' ,
]

function randomNumber(min:number, max:number):number {  
    return Math.floor(Math.random() * (max - min) + min); 
}   

function generateInterests(min:number,max:number):string[] {
    let userInterestsObj = {}
    for(let i=0; i < randomNumber(min,max); i++) {
        let interest = interests[randomNumber(0,interests.length)]
        if (userInterestsObj[interest]) {
            i--
        } else {
            userInterestsObj[interest] = true
        }
    }
    return Object.keys(userInterestsObj)
}

function generateUser(config:profileGeneratorConfig):User {

    let otherInterests = {}
    let otherInterestsArr = generateInterests(config.otherInterestsMin,config.otherInterestsMax)
    otherInterestsArr.forEach(interest => {
        otherInterests[interest] = randomNumber(1,config.maxCategory)
    })

    // fill rest with 0
    for(let intrest of interests) {
        if(!otherInterests[intrest]) {
            otherInterests[intrest] = 0
        }
    }
    
    return {
        userId:uuidv4() as string,
        name:faker.name.findName(),
        email:faker.internet.email(),
        bio:'',
        personalInterests:generateInterests(config.personalInterestsMin,config.personalInterestsMax),
        otherInterests,
        pastUsersMet:[],
        currentMeetings:[]
    }
}


function main(config:profileGeneratorConfig):User[] {
    let users = []
    for(let _ = 0; _ < config.numberProfiles; _++) {
        users.push(generateUser(config))
    }
    for(let _ = 0; _ < config.pastMeetings; _++) {
        let user1 = randomNumber(0,users.length)
        let user2 = randomNumber(0,users.length)
        users[user1].pastUsersMet.push(users[user2].userId)
        users[user2].pastUsersMet.push(users[user1].userId)
    }

    return users
}

export default main