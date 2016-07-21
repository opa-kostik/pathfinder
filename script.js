
var viewBarriers = [];    //view - obstacles
var viewStartId   = "";     //view - start point
var viewFinishId  = "";     //view - end point
var dim     = 0;      //view - table size
var mindim  = 2;      //min table size    
var maxDim  = 100;    //max table size
var colorProcessed = '#777777'; //color of a marked processed cell
var colorEnding = '#E67518';    //color of a marked start/finish point    
var colorDefault = '#CCC';      //color of a non-marked table cell
var colorObstacle = '#1C2833';  //color of a marked obstacle cell
var colorRoute     = '#52BE80'; //color of a table cell if the route is found



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
    
    return Math.abs(currentCell.xPos - this.finishPoint.xPos) + Math.abs(currentCell.yPos - this.finishPoint.yPos);
    
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
        if (this.candidates.currentWeight <= currentCell.currentWeight){
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
        }    
    }    
    
}

function ToggleCell(elemId) {
    if (document.getElementById("r1").checked) 
        ToggleEnds(elemId);
    else 
        ToggleObst(elemId);    
        
}

function ToggleEnds(elemId){

    var viewElem    = document.getElementById(elemId);
    
    //check if the cell is already marked as obstacle => reset it
    var index = viewBarriers.indexOf(elemId);
    if ( index >= 0 ){
        // Delete element
        viewBarriers.splice(index,1);
    }
    
    switch ( elemId ){
        //if we've marked a cell that was previously set as start 
        case viewStartId:
            viewStartId = '';
            viewElem.style.backgroundColor = colorDefault;
            break;
        //..or set as an end    
        case viewFinishId: 
            viewFinishId = '';
            viewElem.style.backgroundColor = colorDefault;
            break;
        //if the cell is not previously marked as Start or Finish    
        default:
            //neither Start nor Finish cell've been picked(marked) so far
            if (!viewStartId && !viewFinishId){
                viewStartId = elemId;    
                viewElem.style.backgroundColor = colorEnding;
            //both Start and Finish cells are picked
            }else if(viewStartId && viewFinishId){
                var viewOldElem = document.getElementById(viewStartId);
                viewOldElem.style.backgroundColor = colorDefault;
                viewStartId = viewFinishId;
                viewFinishId = elemId;    
                viewElem.style.backgroundColor = colorEnding;
            //no Start point picked
            }else if(!viewStartId){
                viewStartId = elemId;
                viewElem.style.backgroundColor = colorEnding;
            //no Finish picked    
            }else if(!viewFinishId){
                viewFinishId = elemId;
                viewElem.style.backgroundColor = colorEnding;
            }
    }    
    
    //Activate Launch('Find route') button if only we've picked 
    //...both Start and Finish
    if (viewStartId && viewFinishId)
        document.getElementById('bProceed').disabled = false;
    else
        document.getElementById('bProceed').disabled = true;
}

function ToggleObst(elemId){
    var viewElem = document.getElementById(elemId);
    var index = viewBarriers.indexOf(elemId);
    if ( index >= 0 ){
        // Delete element
        viewBarriers.splice(index,1);
        viewElem.style.backgroundColor = colorDefault;
    }else{
        if(elemId == viewStartId){ 
            viewStartId = '';
            document.getElementById('bProceed').disabled = true;
        }    
        if(elemId == viewFinishId){ 
            viewFinishId = '';
            document.getElementById('bProceed').disabled = true;
        }    
        viewElem.style.backgroundColor = colorObstacle;
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
                viewElem.style.backgroundColor = colorProcessed;
                
        }//while(true)
        
        if (Game.isFinishReached){
            //WIN!!!
            var oCurrent = Game.finishPoint;
            var nWeight  = Game.finishPoint.currentWeight;
            while(oCurrent.xPos != startPoint.xPos || oCurrent.yPos != startPoint.yPos){
                //draw a route
                viewElem = document.getElementById('X' + oCurrent.xPos + 'Y' + oCurrent.yPos);
                if (nWeight  != Game.finishPoint.currentWeight) 
                    viewElem.style.backgroundColor = colorRoute;
                oCurrent = oCurrent.parentCell;
                //display path order
                viewElem.innerHTML = nWeight--;
            }
            viewElem = document.getElementById('X' + oCurrent.xPos + 'Y' + oCurrent.yPos);
            viewElem.style.backgroundColor = colorEnding;
            
        }else{
            //GAME OVER!!!
            alert("The route can't be found!");
        }
        document.getElementById("bProceed").innerHTML = "REFRESH";
    }catch(err){
        SoftRefresh();
        alert(err.message);
    }
}    

function ResetTableView(){
    
    var viewElem;
    
    for(i = 1; i <= dim; i++){
        for(var j = 1; j <= dim; j++){
            viewElem = document.getElementById('X' + i + 'Y' + j);
            viewElem.style.backgroundColor = colorDefault;
            viewElem.innerHTML = "";
        }
    }
    
    
}

function SoftRefresh(){
    
    var viewElem;
    
    ResetTableView();
    
    //restore obstacles
    for(i = 0; i < viewBarriers.length; i++){
        viewElem = document.getElementById(viewBarriers[i]);
        viewElem.style.backgroundColor = colorObstacle;
    }
    
    //restore Endpoints
    viewElem = document.getElementById(viewStartId);    
    viewElem.style.backgroundColor = colorEnding;
    
    viewElem = document.getElementById(viewFinishId);    
    viewElem.style.backgroundColor = colorEnding;
    
    document.getElementById("bProceed").innerHTML = "FIND ROUTE";
    
}

function Proceed(){
    switch(document.getElementById("bProceed").innerHTML){
        case "REFRESH":
            SoftRefresh();
            break;
        case "FIND ROUTE":
            StartGame();
            break
    }    
}
