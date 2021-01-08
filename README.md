# Phonebook app - backend
RESTful API backend in Node.js, using Express and MongoDB

Course exercise for [Full stack Open 2020](https://fullstackopen.com/) 

[React UI repo here](https://github.com/Deeroil/fullstack-2020/tree/master/osa2/puhelinluettelo)

**[Heroku App link](https://arcane-fjord-79704.herokuapp.com/)**

Functionality:
- Add/delete data from DB through a RESTful API
- Modify existing number by adding a person with the same name 
- UI warns the user if about to modify or delete a person
- Filter list results by name in the UI
- Store data into a Mongo database using Atlas
-	Validation
	* name has to be unique and at least 3 char long
	* number has to be at least 8 char long
-	Error handling

**API Endpoints** 

GET /api/persons - get all persons in the DB

GET /api/persons/:id - a single resource

POST /api/persons - add a person if data is valid

PUT /api/persons/:id - modify a person

DELETE /api/persons/:id - delete a person