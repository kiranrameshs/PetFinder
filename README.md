# Social Network to Find Lost Pets (Pet Finder)

Petfinder is a web application developed to help pet owners post about their lost pet and match them with correct public posts of found pets, improving the accuracy and consistency of owners finding their lost pet without hassle
  - Built on the Social Networking platform where users can login using FB/Google (oAuth support)
  - Uses Google Vision API to generate list of tags with an aggregate score for the uploaded images
  - Algorithms to match the owner with right public-post based on the score generated using the confidence level of the label annotations from the API
  - [WIP] For users to update the last seen location for both lost and found pets by just clicking on the map using Google Maps API 
  - Implement a scoring module to use user location for better match



You can :
  - Upload images of pets on the platform usiing the post feature
  - Check results for best matches of your lost pet from the public posts

 # Inspiration

> Users would be needed to request people to spread the message on social platforms waiting for the posts to reach the right audience
> Public who find a pet on the street can post about it by clicking a picture of the pet without the information of the type of pet, breed or any other information
> List of best matches to be shown to the owners on demand 

### Tech

PetFinder uses below stacks:


* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [MongoDB] - to store user and post details 
* [AWS S3] - Cloud bucket to store uploaded images with security
* [jQuery] - duh
* [Handlebars] - template engine


### Installation

Run the application by clicking below link:
https://damp-island-85486.herokuapp.com/

To run the application locally
Install the dependencies and devDependencies and start the server.
Add keys_dev.js file with correct API ID and secret keys (for ex see the list below)
    MongoURI: ,
    GoogleClientID: ,
    GoogleSecret: ,
    FacebookClientID: ,
    FacebookClientSecret:,
    StripePublishableKey:, ,
    StripeSecretKey: ,
    AWS_Access_Key: ,
    AWS_Secret_Key: ,
    AWS_Bucket_Name:

```sh
$ npm init
$ npm install -all
$ node start/ nodemon
```


### Todos

 - Write MORE Tests
 - Make better pattern matching Algorithms for animals or integrate with Google Vision AI

License
--- ?
