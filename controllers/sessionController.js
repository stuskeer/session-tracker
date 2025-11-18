function getAllSessions(req, res) {
    res.send(
      "🤖 Sessions Route with GET method - this endpoint will get all of the Sessions from the database"
    );
  }
  
  function createSession(req, res) {
    res.send(
      "🤖 Sessions Route with POST method - this endpoint will create a new Session in the database"
    );
  }
  
  function getSessionById(req, res) {
    const SessionId = req.params.id; // <-- this is where we get the id from the request url
    res.send(
      "🤖 Sessions Route with GET method - this endpoint will get a single Session by ID from the database. The Session is: " +
        SessionId
    );
  }
  
  function updateSessionById(req, res) {
    const SessionId = req.params.id; // <-- this is where we get the id from the request url
    res.send(
      "🤖 Sessions Route with PUT method - this endpoint will update a single Session by ID from the database. The Session is: " +
        SessionId
    );
  }
  
  function deleteSessionById(req, res) {
    const SessionId = req.params.id; // <-- this is where we get the id from the request url
    res.send(
      "🤖 Sessions Route with DELETE method - this endpoint will delete a single Session by ID from the database. The Session is: " +
        SessionId
    );
  }
  
  export default {
    getAllSessions,
    createSession,
    getSessionById,
    updateSessionById,
    deleteSessionById,
  };