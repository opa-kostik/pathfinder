
var viewBarriers = [];      //view - obstacles
var viewStartId   = "";     //view - start point
var viewFinishId  = "";     //view - end point
var dim     = 0;            //view - table size
var mindim  = 2;            //view - min table size    
var maxDim  = 100;          //view - max table size
var isGameEnded = false;    //flag is true when the game needs to be restarted

//Cell on a game board
var Cell = function(xPos, yPos, currentWeight, parentCell ){
    //id: "",     //Candidate id, just for the case
    this.xPos              = xPos;            //line index
    this.yPos              = yPos;            //column index
    this.parentCell        = parentCell;      //parent reference
    this.currentWeight     = currentWeight;   //distance from the start point
    this.remainingWeight   = 0;               //outstanding distance 
 }

var Pathfinder = function(dim, a, b, obst){
    this.dim             = dim;
    this.startPoint      = a;
    this.finishPoint     = b;
    this.obstacles       = obst;    
    this.candidates      = [];
    this.processed       = [];
    this.isFinishReached = false; //Win check
}
    
Pathfinder.prototype.getRemainingWeight = function(currentCell){
    
    return Math.abs(currentCell.xPos - this.finishPoint.xPos) 
         + Math.abs(currentCell.yPos - this.finishPoint.yPos);
    
}

Pathfinder.prototype.getNeighbour = function(currentCell, xOffset, yOffset){
    
    //newighbour coordinates
    var xPosNew = currentCell.xPos + xOffset;
    var yPosNew = currentCell.yPos + yOffset;
    
    //check if the neighbour is out of bounds
    if ( xPosNew > this.dim || 
         yPosNew > this.dim ||
         xPosNew < 1         ||
         yPosNew < 1){
        //do not proceed
        return;
    }
    
    //check whether we hit the wall
    for(i = 0; i < this.obstacles.length; i++){
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
}
 
Pathfinder.prototype.addCandidate = function(currentCell){ 

    //check if we already have a better option with this candidate
    var ind = -1;
    for( i = 0; i < this.candidates.length; i++){ 
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
}


function checkInput(event){
    return event.charCode >= 48 && event.charCode <= 57
}

//Initialize view variables
function InitView(){
    
    var table;
    var drawArea;
    
    viewBarriers = [];
    viewStartId   = "";
    viewFinishId  = "";
    
    document.getElementById("bProceed").disabled  = true;
    document.getElementById("bProceed").innerHTML = "FIND ROUTE";
    document.getElementById("r1").checked = true;
    
    dim = document.getElementById("dim").value;
    
    if (dim < mindim) 
        throw new RangeError("be less than " + mindim);
    else if(dim > maxDim) 
        throw new RangeError("exceed " + maxDim);

    drawArea = document.getElementById("DrawArea");
    table = document.getElementById('Table');
    if (table) drawArea.removeChild(table);
    
}

function DrawTable(){
    
    var tr = [];
    var td = [];
    var drawArea = document.getElementById("DrawArea");
    var table = document.createElement('table');
    
    table.setAttribute('id', 'Table' )
    
    for (var i = 0; i < dim; i++){
        tr[i] = document.createElement('tr');   
        //var td = [];
        for (var j = 0; j < dim; j++){
            td[j] = document.createElement('td');   
            td[j].setAttribute('id','X'+ ( i + 1 ) + 'Y' + ( j + 1 ) );
            td[j].addEventListener('click', function(e){
                var viewElemId = e.srcElement.id;
                //set event when the cell is pressed
                ToggleCell(viewElemId);
            });
            tr[i].appendChild(td[j]);
        }
        table.appendChild(tr[i]);
    }
    
    drawArea.appendChild(table);
}

function CreateTable(){
    
    try{
        InitView();    
        DrawTable();
    }catch(err){
        if (err instanceof RangeError) {
            alert("Table size should not " + err.message + "!");
        }else{
            alert(err);
        }    
    }    
    
}

function ToggleCell(elemId) {
    
    if (isGameEnded == true){
        SoftRefresh();
    }
    
    if (document.getElementById("r1").checked) 
        ToggleEnds(elemId);
    else 
        ToggleObst(elemId);    
        
}

function ToggleEnds(elemId){

    var viewElem = document.getElementById(elemId);
    
    //check if the cell is already marked as obstacle => reset it
    var index = viewBarriers.indexOf(elemId);
    if ( index >= 0 ){
        // Delete element
        viewBarriers.splice(index,1);
        viewElem.classList.toggle('obstacle');
    }
    
    switch ( elemId ){
        //if we've marked a cell that was previously set as start 
        case viewStartId:
            viewStartId = '';
            break;
        //..or set as an end    
        case viewFinishId: 
            viewFinishId = '';
            break;
        //if the cell is not previously marked as Start or Finish    
        default:
            //neither Start nor Finish cell've been picked(marked) so far
            if (!viewStartId && !viewFinishId){
                viewStartId = elemId;    
            //both Start and Finish cells are picked
            }else if(viewStartId && viewFinishId){
                var viewOldElem = document.getElementById(viewStartId);
                viewOldElem.classList.toggle("end");
                viewStartId = viewFinishId;
                viewFinishId = elemId;    
            //no Start point picked
            }else if(!viewStartId){
                viewStartId = elemId;
            //no Finish picked    
            }else if(!viewFinishId){
                viewFinishId = elemId;
            }
    }    
    viewElem.classList.toggle('end');
    
    //Activate Launch('Find route') button if only we've picked 
    //...both Start and Finish
    viewElem = document.getElementById('bProceed');
    if (viewStartId && viewFinishId)
        viewElem.disabled = false;
    else
        viewElem.disabled = true;
}

function ToggleObst(elemId){

    var viewElem = document.getElementById(elemId);
    var index = viewBarriers.indexOf(elemId);
    
    viewElem.classList.toggle('obstacle');
    
    //if cell is already in the obstacle list
    if ( index >= 0 ){
        // Delete element
        viewBarriers.splice(index,1);
    }else{
        if(elemId == viewStartId){ 
            viewStartId = '';
            viewElem.classList.toggle('end');
            document.getElementById('bProceed').disabled = true;
        }    
        else if(elemId == viewFinishId){ 
            viewFinishId = '';
            viewElem.classList.toggle('end');
            document.getElementById('bProceed').disabled = true;
        }    
        viewBarriers.push(elemId);
    }
  
}

//get line index based on a cell's name
function getX(elemId){

    return Number( elemId.substring(elemId.indexOf('X')+1, elemId.indexOf('Y') ) );
}        

//get column index based on a cell's name
function getY(elemId){

    return Number( elemId.substring(elemId.indexOf('Y')+1) );
}        

//START - Main algorithm
function StartGame(){

    var obstacles = [];
    var candidate = {};
    var neighbourCell = {};
    var viewElem      = {};
    var cnt   = 0; 
    
    try{
        //collect info about Obstacles on a board
        viewBarriers.forEach(function(item){
            obstacles.push([getX(item), getY(item)]);  
        })
            
        var startPoint  = new Cell(getX(viewStartId) , getY(viewStartId) , 0);
        var finishPoint = new Cell(getX(viewFinishId), getY(viewFinishId));
        
        var Game = new Pathfinder(dim, startPoint, finishPoint, obstacles);
        
        //add start point to the list of Processed cells
        candidate = startPoint;
        
        //loop through opportunities
        while(true){
            Game.processed.push(candidate);
            
            //below
            neighbourCell = Game.getNeighbour(candidate, 1, 0);
            if (neighbourCell){
                Game.addCandidate(neighbourCell);
                if (Game.isFinishReached) break
            }
            //above
            neighbourCell = Game.getNeighbour(candidate, -1, 0);
            if (neighbourCell){
                Game.addCandidate(neighbourCell);
                if (Game.isFinishReached) break
            }
            //right
            neighbourCell = Game.getNeighbour(candidate, 0, 1);
            if (neighbourCell){
                Game.addCandidate(neighbourCell);
                if (Game.isFinishReached) break
            }
            //left
            neighbourCell = Game.getNeighbour(candidate, 0, -1);
            if (neighbourCell){
                Game.addCandidate(neighbourCell);
                if (Game.isFinishReached) break
            }
            
            //there are no candidates left => end of game, no route
            if (!Game.candidates.length) break;
            
            //Now let's pick a candidate with a least 'Total weight' which is (CurrentWeight + RemainingWeight)
            //Considering the list of candidates is sorted by the 'Total weight'  - we pick the 1st one
            candidate = Game.candidates.shift();
            
            //display as processed in the table view
            viewElem = document.getElementById('X' + candidate.xPos + 'Y' + candidate.yPos);
            if (candidate.currentWeight != 0)
                viewElem.classList.toggle('processed');
                
        }//while(true)
        
        if (Game.isFinishReached){
            //WIN!!!
            var oCurrent = Game.finishPoint;
            var nWeight  = Game.finishPoint.currentWeight;
            while(oCurrent.xPos != startPoint.xPos || oCurrent.yPos != startPoint.yPos){
                //draw a route
                viewElem = document.getElementById('X' + oCurrent.xPos + 'Y' + oCurrent.yPos);
                if (nWeight  != Game.finishPoint.currentWeight) 
                    viewElem.classList.add('route');
                oCurrent = oCurrent.parentCell;
                //display path order
                viewElem.innerHTML = nWeight--;
            }
            viewElem = document.getElementById('X' + oCurrent.xPos + 'Y' + oCurrent.yPos);
        }else{
            //GAME OVER!!!
            alert("The route can't be found!");
        }
        document.getElementById("bProceed").innerHTML = "REFRESH";
        isGameEnded = true;
        
    }catch(err){
        SoftRefresh();
        alert(err.message);
    }
}    

function SoftRefresh(){
    
    var viewElem;
    
    //clear CSS class for processed and included in  the route
    for(i = 1; i <= dim; i++){
        for(var j = 1; j <= dim; j++){
            viewElem = document.getElementById('X' + i + 'Y' + j);
            viewElem.classList.remove('route', 'processed');
            viewElem.innerHTML = "";
        }
    }

    document.getElementById("bProceed").innerHTML = "FIND ROUTE";
    isGameEnded = false;
}

function Proceed(){
    switch(document.getElementById("bProceed").innerHTML){
        case "REFRESH":
            SoftRefresh();
            break;
        case "FIND ROUTE":
            StartGame();
            break;
    }    
}
