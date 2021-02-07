import User from './models/user'
import matchingFunction from './matching'
import generateUsers from './profileGenerator'

function scoring(users:User[]):{[key:string]:string[]} {

    interface userIntermediate{
        userId:string,
        mergedMap:{[key:string]:number},
        ranking:string[]
        pastUsersMet:string[]
    }

    let userIntermediates:userIntermediate[] = []

    for(let user of users) {
        let interestsCombined = {...user.otherInterests}
        let votes = Object.keys(interestsCombined).map(key => interestsCombined[key]).reduce((acc,cur) => acc+cur,0)
        let weight = Math.floor(votes * .5 / user.personalInterests.length)
        for(let interest of user.personalInterests) {
            interestsCombined[interest] += weight 
        }
        let new_votes = Object.keys(interestsCombined).map(key => interestsCombined[key]).reduce((acc,cur) => acc+cur,0)
        for(let key in interestsCombined) {
            interestsCombined[key] = interestsCombined[key] / new_votes
        }
        userIntermediates.push({
            userId:user.userId,
            mergedMap:interestsCombined,
            ranking:[],
            pastUsersMet:user.pastUsersMet
        })
    }

    let output = {}
    
    for(let user of userIntermediates) {
        let otherUsers = userIntermediates.filter(otherUser => otherUser.userId != user.userId)
        interface rank {
            rank:number
            userId:string
        }
        let ranks:rank[] = []
        for(let otherUser of otherUsers) {
            let score = 0
            for(let key in user.mergedMap) {
                // check if key even exists in current users map as well
                if(otherUser.mergedMap[key] > user.mergedMap[key] && user.mergedMap[key]) {
                    score += user.mergedMap[key]
                } else if(user.mergedMap[key]) {
                    score += otherUser.mergedMap[key]
                }
            }
            ranks.push({
                rank:score,
                userId:otherUser.userId
            })
        }
        output[user.userId] = [...ranks.sort((a,b) => b.rank - a.rank).filter(otherUser => !user.pastUsersMet.includes(otherUser.userId)).map(rank => rank.userId),...user.pastUsersMet]
    }
    //console.log(Object.keys(output).map(key => output[key].length))
    return output
}


function matching(rankingMap:{[key:string]:string[]}):[string,string][] {
    let translation = Object.keys(rankingMap).reduce((acc,cur,i) => {
        acc[cur] = i
        return acc
    },{})
    let translatedIds = Object.keys(rankingMap)
    .map(userId => rankingMap[userId].map(id => translation[id]))
    let matches = matchingFunction(translatedIds)
    
    // Set up forcing pair matching
    for(let [i,arr] of translatedIds.entries()) {
        if(arr.length == 1) {
            translatedIds[arr[0]] = [i]
        }
    }
    // Deal with multi-case
    for(let [i,arr] of translatedIds.entries()) {
        if(arr.length > 1) {
            for(let option of arr) {
                if(translatedIds[option].includes(i) || translatedIds[option].length == 0) {
                    translatedIds[i] = [option]
                }
            }
        }
    }

    // Deal with empty
    for(let [i,arr] of translatedIds.entries()) {
        if(arr.length == 0) {
            for(let [j,arr2] of translatedIds.entries()) {
                if(arr2.length > 1) {
                    translatedIds[i] = [j]
                    translatedIds[j] = [i]
                }
            }
            // still empty
            if(translatedIds[i].length == 0) {
                let seen = {}
                let j = 0
                while(translatedIds[i].length == 0) {
                    if (seen[translatedIds[j][0]]) {
                        translatedIds[i] = [j]
                        translatedIds[j] = [i]
                    } else {
                        seen[translatedIds[j][0]] = true
                    }
                }
            }
        }
    }

    let reverseTranslation = Object.entries(translation).reduce((acc,[key,val]) => {
        acc[val as number] = key
        return acc
    },{})

    let ids = translatedIds.map(person => reverseTranslation[person[0]])
    let dataEnsure = {}
    for(let id of ids) {
        dataEnsure[id] = true
    }

    // Checking if error in matching function. Crashes program if it is not correct
    if(Object.keys(dataEnsure).length != Object.keys(rankingMap).length) {
        console.log(translatedIds)
        console.log(Object.keys(dataEnsure).length)
        console.log('Matching Error')
        process.exit(1)
    }

    
    let completeMatches:[string,string][] = []
    for(let [i,arr] of translatedIds.entries()) {
        if(arr) {
            completeMatches.push([reverseTranslation[arr[0]],reverseTranslation[arr[0]]])
            translatedIds[arr[0]] = null
            translatedIds[i] = null
        }
    }
    return completeMatches
}


function main() {

    let users = generateUsers({
        numberProfiles:40,
        personalInterestsMin:4,
        personalInterestsMax:10,
        otherInterestsMax:20,
        otherInterestsMin:10,
        maxCategory:5,
        pastMeetings:4
    })

    let userScoring = scoring(users)
    let matches = matching(userScoring)

    // change userId back to name
    let idToName = users.reduce((acc,user) => {
        acc[user.userId] = user.name
        return acc
    },{})
    

    console.log(matches.map(match => match.map(id => idToName[id])))

}

main()
