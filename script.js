
var gaBarriers = [];
var gsStart   = "";
var gsFinish  = "";
var gnDim     = 0;    
var gColorProcessed = '#777777';
var gColorEnding = '#E67518';
var gColorDefault = '#CCC';
var gColorObstacle = '#1C2833';
var gColorRoute     = '#52BE80';


//Cell on a game board
var Cell = function(nXPos, nYPos, nCurrentWeight, oParent ){
    //id: "",     //Candidate id, just for the case
    this.nXPos              = nXPos;            //line index
    this.nYPos              = nYPos;            //column index
    this.oParent            = oParent;          //parent reference
    this.nCurrentWeight     = nCurrentWeight;   //distance from the start point
    this.nRemainingWeight   = 0;                //outstanding distance 
 }

var Pathfinder = function(nDim, oA, oB, aObst){
    this.nDim           = nDim;
    this.oStart         = oA;
    this.oFinish        = oB;
    this.aObstacles     = aObst;    
    this.aCandidates    = [];
    this.aProcessed     = [];
    this.IsFinishReached= false; //Win check
}
    
Pathfinder.prototype.getRemainingWeight = function(oX){
    
    return Math.abs(oX.nXPos - this.oFinish.nXPos) + Math.abs(oX.nYPos - this.oFinish.nYPos);
    
}

Pathfinder.prototype.getNeighbour = function(oX, nXOffset, nYOffset){
    
    //newighbour coordinates
    var nXPosNew = oX.nXPos + nXOffset;
    var nYPosNew = oX.nYPos + nYOffset;
    
    //check if the neighbour is out of bounds
    if ( nXPosNew > this.nDim || 
         nYPosNew > this.nDim ||
         nXPosNew < 1         ||
         nYPosNew < 1){
        //do not proceed
        return;
    }
    
    //check whether we hit the wall
    for(i = 0; i < this.aObstacles.length; i++){
        if ( this.aObstacles[i][0] == nXPosNew &&
             this.aObstacles[i][1] == nYPosNew )
            //do not proceed
            return;
    }
    
    //check whether we looking at the closed cell 
    for(i = 0; i < this.aProcessed.length; i++){
        if ( this.aProcessed[i].nXPos == nXPosNew &&
             this.aProcessed[i].nYPos == nYPosNew )
            //do not proceed
            return;
    }
    
    //all checks cleared...please proceed
    var oCellNew  = new Cell(nXPosNew, nYPosNew, oX.nCurrentWeight + 1, oX);
    oCellNew.nRemainingWeight = this.getRemainingWeight(oCellNew);
    return oCellNew;
}
 
Pathfinder.prototype.addCandidate = function(oX){ 

    //check if we already have a better option with this candidate
    var nIndex = -1;
    for( i = 0; i < this.aCandidates.length; i++){ 
        if (this.aCandidates[i].nXPos == oX.nXPos && 
            this.aCandidates[i].nYPos == oX.nYPos) 
            nIndex = i;
    }

    if (nIndex > -1){ 
        //found
        if (this.aCandidates.nCurrentWeight <= oX.nCurrentWeight){
            return false;
        }else{
            //the better one found, current to be deleted
            this.aCandidates.splice(nIndex, 1);
            //and continue
        }    
    }
    
    //not found or better one found
    //add new according to the weight order
    nIndex = 0;
    for( i = this.aCandidates.length - 1; i >=0; i--){
        //compare total weight
        if( ( oX.nCurrentWeight + oX.nRemainingWeight ) >
            ( this.aCandidates[i].nCurrentWeight + 
            this.aCandidates[i].nRemainingWeight ) ){
            nIndex = i + 1;
            break;    
        }
    }

    //insert into i-place
    this.aCandidates.splice(nIndex, 0, oX);    
    
    if ( oX.nXPos == this.oFinish.nXPos &&
         oX.nYPos == this.oFinish.nYPos ){
        
        this.oFinish = oX;
        this.IsFinishReached = true;     
    }         
            
    
    return true;
}


function checkInput(event){
    return event.charCode >= 48 && event.charCode <= 57
}

function CreateTable(){
    
    Refresh();
    
    var eDrawArea = document.getElementById("DrawArea");
    var nDim = document.getElementById("nDim").value;
    
    //set global variable
    gnDim = nDim;
    
    if (nDim < 1) {
        //ask for natural number
        alert('Please make sure you enter integer positive number!');
        return;   
    }    
        
    var table;
    table = document.getElementById('Table');
    
    if (table) eDrawArea.removeChild(table);
    
    table = document.createElement('table');
    table.setAttribute('id', 'Table' )
    var tr = [];
    var td = [];
    
    for (var i = 0; i < nDim; i++){
        tr[i] = document.createElement('tr');   
        //var td = [];
        for (var j = 0; j < nDim; j++){
            td[j] = document.createElement('td');   
            td[j].setAttribute('id','X'+ ( i + 1 ) + 'Y' + ( j + 1 ) );
            // td[j].addEventListener('click', ToggleCell(i,j) );
            td[j].addEventListener('click', function(e){
                var elemId = e.srcElement.id;
                ToggleCell(elemId);
            });
            tr[i].appendChild(td[j]);
        }
        table.appendChild(tr[i]);
    }
    
    eDrawArea.appendChild(table);
}

function ToggleCell(elemId) {
    if (document.getElementById("r1").checked) 
        ToggleEnds(elemId);
    else 
        ToggleObst(elemId);    
        
}

function ToggleEnds(elemId){

    var eCell    = document.getElementById(elemId);
    
    //check if the cell is already marked as obstacle => reset it
    var index = gaBarriers.indexOf(elemId);
    if ( index >= 0 ){
        // Delete element
        gaBarriers.splice(index,1);
    }
    
    switch ( elemId ){
        //if we've marked a cell that was previously set as start 
        case gsStart:
            gsStart = '';
            eCell.style.backgroundColor = gColorDefault;
            break;
        //..or set as an end    
        case gsFinish: 
            gsFinish = '';
            eCell.style.backgroundColor = gColorDefault;
            break;
        //if the cell is not previously marked as Start or Finish    
        default:
            //neither Start nor Finish cell've been picked(marked) so far
            if (!gsStart && !gsFinish){
                gsStart = elemId;    
                eCell.style.backgroundColor = gColorEnding;
            //both Start and Finish cells are picked
            }else if(gsStart && gsFinish){
                var eOldCell = document.getElementById(gsStart);
                eOldCell.style.backgroundColor = gColorDefault;
                gsStart = gsFinish;
                gsFinish = elemId;    
                eCell.style.backgroundColor = gColorEnding;
            //no Start point picked - ??is this ever possible    
            }else if(!gsStart){
                gsStart = elemId;
                eCell.style.backgroundColor = gColorEnding;
            //no Finish picked    
            }else if(!gsFinish){
                gsFinish = elemId;
                eCell.style.backgroundColor = gColorEnding;
            }
    }    
    
    //Activate Launch('Find route') button if only we've picked 
    //...both Start and Finish
    if (gsStart && gsFinish)
        document.getElementById('bProceed').disabled = false;
    else
        document.getElementById('bProceed').disabled = true;
}

function ToggleObst(elemId){
    var eCell = document.getElementById(elemId);
    var index = gaBarriers.indexOf(elemId);
    if ( index >= 0 ){
        // Delete element
        gaBarriers.splice(index,1);
        eCell.style.backgroundColor = gColorDefault;
    }else{
        eCell.style.backgroundColor = gColorObstacle;
        gaBarriers.push(elemId);
        
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

    var aObstacles = [];
    var oCandidate = {};
    var oNeighbour = {};
    var eCell      = {};
    var nCounter   = 0; 
    
    try{
        //collect info about Obstacles on a board
        gaBarriers.forEach(function(item){
            aObstacles.push([getX(item), getY(item)]);  
        })
            
        var oStart  = new Cell(getX(gsStart) , getY(gsStart) , 0);
        var oFinish = new Cell(getX(gsFinish), getY(gsFinish));
        
        var Game = new Pathfinder(gnDim, oStart, oFinish, aObstacles);
        
        //add start point to the list of Processed cells
        oCandidate = oStart;
        
        //loop through opportunities
        while(true){
            Game.aProcessed.push(oCandidate);
            
            //below
            oNeighbour = Game.getNeighbour(oCandidate, 1, 0);
            if (oNeighbour){
                Game.addCandidate(oNeighbour);
                if (Game.IsFinishReached) break
            }
            //above
            oNeighbour = Game.getNeighbour(oCandidate, -1, 0);
            if (oNeighbour){
                Game.addCandidate(oNeighbour);
                if (Game.IsFinishReached) break
            }
            //right
            oNeighbour = Game.getNeighbour(oCandidate, 0, 1);
            if (oNeighbour){
                Game.addCandidate(oNeighbour);
                if (Game.IsFinishReached) break
            }
            //left
            oNeighbour = Game.getNeighbour(oCandidate, 0, -1);
            if (oNeighbour){
                Game.addCandidate(oNeighbour);
                if (Game.IsFinishReached) break
            }
            
// //++LOGS - TO COMMENT            
//             //PRINT OUT CANDIDATES
//             console.log("-----------------------------------------------------------");
//             console.log("Candidates: ");
//             for(i=0;i<Game.aCandidates.length; i++){
//                 console.log("(" + Game.aCandidates[i].nXPos + " : " 
//                 + Game.aCandidates[i].nYPos + ") " 
//                 + Game.aCandidates[i].nCurrentWeight + " " 
//                 + Game.aCandidates[i].nRemainingWeight);
//             }
// //--LOGS - TO COMMENT

            //there are no candidates left => end of game, no route
            if (!Game.aCandidates.length) break;
            
            //Now let's pick a candidate with a least 'Total weight' which is (CurrentWeight + RemainingWeight)
            //Considering the list of aCandidates is sorted by the 'Total weight'  - we pick the 1st one
            oCandidate = Game.aCandidates.shift();
            
            //display as processed in the table view
            eCell = document.getElementById('X' + oCandidate.nXPos + 'Y' + oCandidate.nYPos);
            if (oCandidate.nCurrentWeight != 0)
                eCell.style.backgroundColor = gColorProcessed;
                
// //++LOGS - TO COMMENT
//             eCell.innerHTML = eCell.innerHTML + 
//                 "(N" + (++nCounter) + 
//                 "C" + oCandidate.nCurrentWeight + 
//                 "R" + oCandidate.nRemainingWeight + ")"; 
//             console.log("Current cell: ");
//             console.log("(" + oCandidate.nXPos + " : " + oCandidate.nYPos + ")");
// //--LOGS - TO COMMENT
   
        }//while(true)
        
        if (Game.IsFinishReached){
            //WIN!!!
            var oCurrent = Game.oFinish;
            var nWeight  = Game.oFinish.nCurrentWeight;
            while(oCurrent.nXPos != oStart.nXPos || oCurrent.nYPos != oStart.nYPos){
                //draw a route
                eCell = document.getElementById('X' + oCurrent.nXPos + 'Y' + oCurrent.nYPos);
                if (nWeight  != Game.oFinish.nCurrentWeight) 
                    eCell.style.backgroundColor = gColorRoute;
                oCurrent = oCurrent.oParent;
                //display path order
                eCell.innerHTML = nWeight--;
            }
            eCell = document.getElementById('X' + oCurrent.nXPos + 'Y' + oCurrent.nYPos);
            eCell.style.backgroundColor = gColorEnding;
            
        }else{
            //GAME OVER!!!
            alert("The route can't be found!");
        }
        document.getElementById("bProceed").innerHTML = "REFRESH";
    }catch(err){
        Refresh();
        alert(err.message);
    }
}    

function Refresh(){
    gaBarriers = [];
    gsStart   = "";
    gsFinish  = "";
    var elem = "";
    
    for(i = 1; i <= gnDim; i++){
        for(j = 1; j <= gnDim; j++){
            elem = document.getElementById('X' + i + 'Y' + j);
            elem.style.backgroundColor = gColorDefault;
            elem.innerHTML = "";
        }
    }
    document.getElementById("bProceed").innerHTML = "START";
    document.getElementById("bProceed").disabled = true;
    
    document.getElementById("r1").checked = true;
}

function Proceed(){
    switch(document.getElementById("bProceed").innerHTML){
        case "REFRESH":
            Refresh();
            break;
        case "START":
            StartGame();
            break
    }    
}
