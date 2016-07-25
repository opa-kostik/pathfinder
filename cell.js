//Cell on a game board
function Cell(xPos, yPos, currentWeight, parentCell ){
    //id: "",     //Candidate id, just for the case
    this.xPos              = xPos;            //line index
    this.yPos              = yPos;            //column index
    this.parentCell        = parentCell;      //parent reference
    this.currentWeight     = currentWeight;   //distance from the start point
    this.remainingWeight   = 0;               //outstanding distance 
 }
