import { handleDate } from './handleTime.js'

const requests = async (urls) => {
    try {
        const data = await Promise.all(
            urls.map(
                url => fetch(url).then(
                            response => response.json()
                )
            )
        )
        activateListeners()
        printLeaderboard(data[0])
        printGameList(data[1])
        console.log(data[1])

        if(data[1].loggedIn != null){
            document.querySelector('#loginInfo').innerHTML = `Welcome ${ data[1].loggedIn.name }!`
            showHide('logged', 'noLogged')
        }

    } catch(err) {
        console.log(err)
    }
}

onload = (() => requests(['/api/leaderboard', '/api/games']) )()

const printGameList = ({gameList}) => {
    const list = document.querySelector('#list')

    list.innerHTML = gameList.map(game => {
        const { game_id, created, gamePlayers } = game
        const { date, hour, minute } = handleDate(created)

        const player01 = (gamePlayers[0]) ? gamePlayers[0].player.name : ' -- '
        const player02 = (gamePlayers[1]) ? gamePlayers[1].player.name : ' -- '            
        
        return `
                <li>
                    <p class="my-3 font-weight-bold my-text">
                        Game: ${ game_id }, created ${date} at ${hour}:${minute}
                    </p>
                    <p class="ml-3 mb-0">Player 1: ${ player01 }</p>
                    <p class="ml-3 mb-0">Player 2: ${ player02 }</p>
                </li>
                `
    }).join('')
}

const workWithScoresArray= (scoresArr) => {
    const playersScoreObj = {
        '0': 0,
        '0.5': 0,
        '1': 0}

    scoresArr.forEach(scoreVal => playersScoreObj[scoreVal]++)
    return playersScoreObj
}

const printLeaderboard = (dataLB) => {
    console.log({dataLB})
    let template = '';
    
    dataLB.forEach(player => {
        const { player_id, player_name, scores } = player
        const scoresObj = workWithScoresArray(scores)
        if(scores.length > 0){
            const scoresSum = scores.reduce((acc, cur) => acc + cur)
            template += 
                `
                    <tr>
                        <td>${ player_id }</td>
                        <td>${ player_name }</td>
                        <td class="text-center">${ scoresObj['1'] } - ${ scoresObj['0.5'] } - ${ scoresObj['0'] } </td>
                        <td class="text-center">${ scoresSum }</td>
                    </tr>
                `
        }
    })

    document.querySelector('#lboard').innerHTML = template
}

const activateListeners = () => {
    document.querySelector('#runGameList').addEventListener('click', handleRunGameListClick)
    document.querySelector('#runLeaderboard').addEventListener('click', handleRunLeaderboard)
    document.querySelector('#login').addEventListener('click', login)
    document.querySelector('#logout').addEventListener('click', logout)
    document.querySelector('#createAccount').addEventListener('click', handleShowSignInForm)
    document.querySelector('#signIn').addEventListener('click', signIn)
}

const handleRunGameListClick = () => {
    document.querySelector('#gameList').style.display = 'block'
    document.querySelector('#leaderboard').style.display = 'none'
}

const handleRunLeaderboard = () => {
    document.querySelector('#gameList').style.display = 'none'
    document.querySelector('#leaderboard').style.display = 'block'
}

const handleShowSignInForm = () => {
    showHide('signInFormPart', 'loginFormPart')
}

const showHide = (showID, hideID) => {
    document.querySelector(`#${ showID }`).style.display = 'block'
    document.querySelector(`#${ hideID }`).style.display = 'none'
}

function signIn(){
    const form = document.querySelector('#formSignIn')

    fetch("/api/players", {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `name=${ form[0].value }&userName=${ form[1].value }&password=${ form[2].value }`,
    })
    .then(response => console.log(response))
    .then(() => {
        console.log('signed in')
        location.reload()
    })
    .catch(error => console.log('Error:', error))
}

function login(){
    const form = document.querySelector('#formLogin')
    
    fetch("/api/login", {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `userName=${ form[0].value }&password=${ form[1].value }`,
    })
    .then(response => console.log(response))
    .then(() => {
        console.log('logged in')
        location.reload()
    })
    .catch(error => console.log('Error:', error))

    // const response = await fetch('/api/login', {
    //     method: 'post',
    //     body: JSON.stringify(player)
    // })
    // const data = await response.json()
    // console.log({data})
}

const logout = () => {
    fetch("/api/logout",{
        credentials: 'include',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: '',
    })
    .then(() => {
        console.log('logged out')
        location.reload()
    })
    .catch(error => console.log('Error:', error))
}
