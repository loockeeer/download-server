# Download Server

This is a download server, allowing you to deploy files and updates without having to download all the files.

It uses a hash of the tree to be deployed, which is compared with the client's hash before sending back the different files that have changed.

## Start

You can start it with `npm run start`

You can also specify `PORT` (number), `HOST` (string) and `DEBUG` (boolean) env. variables if you want to configure them.

## Where to put files
You just need to put them into a `public` folder at the root of the app

## How does it works ?

You can check [this file](https://github.com/loockeeer/download-server/blob/master/test/index.js) if you want to see how you could implement a client for it.

First, you need to compute the hash of every file on the client side.
Then, put them into an array like that : 
```js
const files = [
  {
    relativePath: "src/index.js",
    hash: "2988785785"
  }
]
```
Note: the hash is a sha1 hash of the file 

After that you can send it to the API at route `/compare` in a POST request. The body part is a json like that: 
```json
{
  "files": ["YOUR FILES"]
}
```

The server will send you an Array like the one you sent, but with the files you need to download and a field "op" with either "download" or "remove".

To download a file, just make a GET request at `/download/PATH` where `PATH` is the `relativePath` you received for the file you are downloading. Finally, if you want, you can compute the hash of the files you received and compare to the ones the server sent.
