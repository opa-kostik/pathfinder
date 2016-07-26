function App(boardSize){
    
    this.boardSizeMin        = 2;               //view - min table size    
    this.boardSizeMax        = 100;             //view - max table size

    this.viewBarriers        = [];               //view - obstacles
    this.viewStartId         = "";               //view - start point
    this.viewFinishId        = "";               //view - end point
    this.isGameEnded         = false;            //flag is true when the game needs to be restarted
    
    this.cellType_Default    = 0;
    this.cellType_Start      = 1; 
    this.cellType_Finish     = 2;
    this.cellType_Obstacle   = 3;                      
    
    if (boardSize < this.boardSizeMin || boardSize > this.boardSizeMax) 
        throw new Error("Board size should be in range from " + 
            this.boardSizeMin + ' to ' + this.boardSizeMax);
    else
        this.boardSize = boardSize;             //view - table size

    this.Game = {};
}

App.prototype.GetCellType = function(cellId){
    
    var index = this.viewBarriers.indexOf(cellId);
    if ( index >= 0 )
        return this.cellType_Obstacle;
    else if (cellId == this.viewStartId)
        return this.cellType_Start;
    else if (cellId == this.viewFinishId)
        return this.cellType_Finish;
    else 
        return this.cellType_Default;
};

App.prototype.UpdateEnd = function(cellId){

    var cellType = this.GetCellType(cellId);
    
    switch(cellType){
        case this.cellType_Start:
            //Add
            this.viewStartId = '';
            this.viewBarriers.push(cellId);
            break;
        case this.cellType_Finish:
            //Add
            this.viewFinishId = '';
            this.viewBarriers.push(cellId);
            break;
        default:
            if (cellType == this.cellType_Obstacle){
                // Delete
                var index = this.viewBarriers.indexOf(cellId);
                this.viewBarriers.splice(index,1);
            }    
            //either Start or Finish cell 've been selected so far
            if (!this.viewStartId)
                this.viewStartId = cellId;    
            else if(!this.viewFinishId)
                this.viewFinishId = cellId;
            else{    
                //take the Start cell as a substitute
                var cellIdOld = this.viewStartId;
                this.viewStartId = this.viewFinishId;
                this.viewFinishId = cellId;    
            }
    }    
    //return value if a cell was substituted
    return cellIdOld;
};

App.prototype.UpdateObst = function(cellId){

    var index;
    var cellType = this.GetCellType(cellId);
    
    switch(cellType){
        case this.cellType_Obstacle:
            // Delete
            index = this.viewBarriers.indexOf(cellId);
            this.viewBarriers.splice(index,1);
            break;
        case this.cellType_Start:
            //Add
            this.viewStartId = '';
            this.viewBarriers.push(cellId);
            break;
        case this.cellType_Finish:
            //Add
            this.viewFinishId = '';
            this.viewBarriers.push(cellId);
            break;
        default:     
            this.viewBarriers.push(cellId);
    }
    
};

//get line index based on a cell's name
App.prototype.getX = function(cellId){

    return Number( cellId.substring(cellId.indexOf('X')+1, cellId.indexOf('Y') ) );
};        

//get column index based on a cell's name
App.prototype.getY = function(cellId){

    return Number( cellId.substring(cellId.indexOf('Y')+1) );
};        

App.prototype.IsStartGameAllowed = function(){
    
    if(this.viewStartId && this.viewFinishId)
        return true;
    else 
        return false;    
    
};

App.prototype.GetBoardSize = function(){
    
    return this.boardSize;
    
};

//Game preparation
App.prototype.SetupGame = function(){

    var startPoint  = new Cell(this.getX(this.viewStartId) , this.getY(this.viewStartId) , 0);
    var finishPoint = new Cell(this.getX(this.viewFinishId), this.getY(this.viewFinishId));
    
    //collect info about Obstacles on a board
    var obstacles       = [];
    for(var i = 0; i < this.viewBarriers.length; i++){ 
        obstacles.push([this.getX(this.viewBarriers[i]), this.getY(this.viewBarriers[i])]);  
    }
    
    this.Game = new Pathfinder(this.boardSize, startPoint, finishPoint, obstacles);
    
    //add start point to the list of Processed cells
    return startPoint;
};

App.prototype.ProcessCell = function(candidate){
    
    //below
    var neighbourCell = this.Game.getNeighbour(candidate, 1, 0);
    if (neighbourCell){
        this.Game.addCandidate(neighbourCell);
        if (this.Game.isFinishReached) return;
    }
    //above
    neighbourCell = this.Game.getNeighbour(candidate, -1, 0);
    if (neighbourCell){
        this.Game.addCandidate(neighbourCell);
        if (this.Game.isFinishReached) return;
    }
    //right
    neighbourCell = this.Game.getNeighbour(candidate, 0, 1);
    if (neighbourCell){
        this.Game.addCandidate(neighbourCell);
        if (this.Game.isFinishReached) return;
    }
    //left
    neighbourCell = this.Game.getNeighbour(candidate, 0, -1);
    if (neighbourCell){
        this.Game.addCandidate(neighbourCell);
        if (this.Game.isFinishReached) return;
    }
    
    //there are no candidates left => end of game, no route
    if (!this.Game.candidates.length) return;
    
    //mark current as processed
    this.Game.processed.push(candidate);
    //select new candidate
    var nextCandidate = this.Game.candidates.shift();
    
    return nextCandidate;
};    

App.prototype.GetRoute = function(){ 
    
    var resultRoute = [];
    var curCell = this.Game.finishPoint;
    while(curCell.xPos != this.Game.startPoint.xPos || curCell.yPos != this.Game.startPoint.yPos){
        //draw a route
        resultRoute.push(curCell);
        // if (curWeight  != Game.finishPoint.currentWeight) 
        curCell = curCell.parentCell;
    }
    return resultRoute;
    
};