function Pathfinder(dim, a, b, obst){
    this.boardSize       = dim;
    this.startPoint      = a;
    this.finishPoint     = b;
    this.obstacles       = obst;    
    this.candidates      = [];
    this.processed       = [];
    this.isFinishReached = false; //Win check
}
    
Pathfinder.prototype.getRemainingWeight = function(currentCell){
    
    return Math.abs(currentCell.xPos - this.finishPoint.xPos) +
           Math.abs(currentCell.yPos - this.finishPoint.yPos);
    
};

Pathfinder.prototype.getNeighbour = function(currentCell, xOffset, yOffset){
    
    //newighbour coordinates
    var xPosNew = currentCell.xPos + xOffset;
    var yPosNew = currentCell.yPos + yOffset;
    
    //check if the neighbour is out of bounds
    if ( xPosNew > this.boardSize || 
         yPosNew > this.boardSize ||
         xPosNew < 1              ||
         yPosNew < 1){
        //do not proceed
        return;
    }
    
    //check whether we hit the wall
    for(var i = 0; i < this.obstacles.length; i++){
        if ( this.obstacles[i][0] == xPosNew &&
             this.obstacles[i][1] == yPosNew )
            //do not proceed
            return;
    }
    
    //check whether we looking at the closed cell 
    for(i = 0; i < this.processed.length; i++){
        if ( this.processed[i].xPos == xPosNew &&
             this.processed[i].yPos == yPosNew )
            //do not proceed
            return;
    }
    
    //all checks cleared...please proceed
    var newCell  = new Cell(xPosNew, yPosNew, currentCell.currentWeight + 1, currentCell);
    newCell.remainingWeight = this.getRemainingWeight(newCell);
    return newCell;
};
 
Pathfinder.prototype.addCandidate = function(currentCell){ 

    //check if we already have a better option with this candidate
    var ind = -1;
    for(var i = 0; i < this.candidates.length; i++){ 
        if (this.candidates[i].xPos == currentCell.xPos && 
            this.candidates[i].yPos == currentCell.yPos) 
            ind = i;
    }

    if (ind > -1){ 
        //found
        if (this.candidates[ind].currentWeight <= currentCell.currentWeight){
            return false;
        }else{
            //the better one found, current to be deleted
            this.candidates.splice(ind, 1);
            //and continue
        }    
    }
    
    //not found or better one found
    //add new according to the weight order
    ind = 0;
    for( i = this.candidates.length - 1; i >=0; i--){
        //compare total weight
        if( ( currentCell.currentWeight + currentCell.remainingWeight ) >
            ( this.candidates[i].currentWeight + 
            this.candidates[i].remainingWeight ) ){
            ind = i + 1;
            break;    
        }
    }

    //insert into i-place
    this.candidates.splice(ind, 0, currentCell);    
    
    if ( currentCell.xPos == this.finishPoint.xPos &&
         currentCell.yPos == this.finishPoint.yPos ){
        
        this.finishPoint = currentCell;
        this.isFinishReached = true;     
    }         
            
    return true;
};