// hash-password.js
'use strict';

const bcrypt = require('bcryptjs');

// Change this to whatever password you want
const plainPassword = 'admin@123';

async function run() {
    const hash = await bcrypt.hash(plainPassword, 10); // 10 = salt rounds
    console.log(`Plain: ${plainPassword}`);
    console.log(`Hash: ${hash}`);
}

run();
