const { spawn, exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs/promises')

async function main() {
    // create client public directory
    await fs.mkdir('./test/public', { recursive: true })

    // copy a git repository in the server's public directory
    const REPOSITORY_URL = "https://github.com/loockeeer/minecraft-launcher"

    await (promisify(exec)('git clone ' + REPOSITORY_URL + ' public'))
    await (promisify(exec)('rm -rf public/.git'))

    // spawn the server process
    const server = spawn('node', ['src/index.js'])

    server.stdout.on('data', data => {
        console.log("SERVER LOG :", data.toString())
        if(data.includes('Server started')) {
            // spawn the client process
            const client = spawn('node', ['./test/index.js'])
            client.stderr.on('data', d => console.log(d.toString()))
            client.stdout.on('data', d => console.log(d.toString()))
            client.on('close', () => {
                // spawn the diff process
                server.kill()
                exec('diff -qr ./public ./test/public', (err, stdout) => {
                    console.log(stdout.toString())

                    if(stdout.length > 1) {
                        console.error('The two public folders differ')
                        process.exit(1)
                    } else {
                        console.log('The two public folders are the same')
                        process.exit(0)
                    }
                })
            })
        }
    })

    server.stderr.on('data', d=> console.log(d.toString()))
}
main()