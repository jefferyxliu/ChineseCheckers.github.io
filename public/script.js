const socket = io(`http://localhost:3001`)
//HTML elements and eventbindings:
//HTML canvas
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
function draw_spaces() {
    for (let a = -8; a < 9; a++) {
        for (let b = -8; b < 9; b++) {
            if ((a <= 4 && b <= 4 && -a-b <= 4) || (a >= -4 && b >= -4 && -a-b >= -4)) {
                const x = 20 * (a - b);
                const y = 20 * 1.73 * (a + b);
                ctx.beginPath();
                ctx.arc(300 + x, 300 + y, 5, 0 , 2 * Math.PI);
                ctx.fillStyle = "black";
                ctx.fill();
            }
        }
    }
}
function draw_pieces(position) {
    for (const color in position) {
        for (const coord of position[color]) {
            ctx.beginPath();
            ctx.arc(300 + 20 * coord[0], 300 - 20 * 1.73 * coord[1], 10, 0 , 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
}
var loadmove
canvas.addEventListener('mousedown', event => {
    const x = event.offsetX - 300;
    const y = event.offsetY - 300;
    loadmove = [Math.round(x / 40 + y / 40 / 1.73), Math.round(-x / 40 + y / 40 / 1.73)]
})
canvas.addEventListener('mouseup', event => {
    const x = event.offsetX - 300;
    const y = event.offsetY - 300;
    const sendmove = [Math.round(x / 40 + y / 40 / 1.73), Math.round(-x / 40 + y / 40 / 1.73)]
    if (loadmove !== sendmove) {
        send_command('move', [[loadmove[0],loadmove[1],-loadmove[0]-loadmove[1]],[sendmove[0],sendmove[1],-sendmove[0]-sendmove[1]]])
    }
    loadmove = undefined
})

//HTML chatbox and textbox and return button
let chatbox = document.getElementById('chatbox');
let text = document.getElementById('text');
let returnbutton = document.getElementById('returnbutton');
returnbutton.addEventListener('click', event => {
    send_message(text.value);
    text.value = '';
})

text.addEventListener('keypress', event => {
    if (event.keyCode === 13) {
        event.preventDefault();
        send_message(text.value);
        text.value = '';
    }
})

//HTML participants box
let participantsbox = document.getElementById('participants')

//HTML Game Settings Buttons
let startbutton = document.getElementById('startbutton');
startbutton.addEventListener('click', event => {
    n = document.getElementById('numplayers').value
    send_command('set_up',[n]);
})

//socket client programming

const name = prompt('Enter username: ')
socket.emit('new-user', name)
console.log(`${name} joined.`)
chatbox.value += `${name} joined.\n`;

//receiving new connection message
socket.on('user-connected', name => {
    console.log(`${name} joined.`);
    chatbox.value += `${name} joined.\n`;
})

//receiving a chat-message
socket.on('chat-message', data => {
    console.log(`${data.name}: ${data.message}`);
    chatbox.value += `${data.name}: ${data.message}\n`
})

//sending a chat-message
function send_message(message = 'sample message') {
    socket.emit('send-chat-message', message);
    console.log(`${name}: ${message}`);
    chatbox.value += `${name}: ${message}\n`
}

//receiving disconnection message
socket.on('user-disconnected', name => {
    console.log(`${name} left.`);
    chatbox.value += `${name} left.\n`
})

//sending a game command
//list of commands implemented:
//function: 'set_up', parameters: [gamemode, [colors0-5](optional colors)]
//function: 'reset', parameters: null
//function: 'is_legal', parameters: [[x1,y1,z1],[x2,y2,z2]]
//function: 'move', parameters: [[x1,y1,z1],[x2,y2,z2]]
function send_command(command, parameters) {
    socket.emit(command, parameters);
}

//receiving command output
socket.on('command', message => {
    console.log(`${message}`);
    chatbox.value += `${message}\n`
})

//receiving a board position of all pieces (an object {'color': [[x1,y1],[x2,y2],...]})
socket.on('board', position => {
    console.log(position);
    ctx.clearRect(0,0,600,600);
    draw_spaces();
    draw_pieces(position);
})

//recieving a list of participants
socket.on('participants', participants => {
    participantsbox.value = participants.join('\n');
})