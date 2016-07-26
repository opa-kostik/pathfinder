function Controller(){
    
    this.app = {};    
}

Controller.prototype.CreateTable = function(){
    
    var _this = this.myObject;
    try{
        _this.InitView();    
        _this.DrawTable();
    }catch(err){
        _this.ShowMessage(err);
    }    
    
};

Controller.prototype.InitView = function(){
    
    var size = Number(document.getElementById('boardSize').value);
    var drawArea = document.getElementById('drawArea');
    var table = document.getElementById('drawArea__table');
    
    this.app = new App(size);
    
    if (table) 
        drawArea.removeChild(table);
    
};

Controller.prototype.DrawTable = function(){
    
    var tr = [];
    var td = [];
    var self = this;
    
    var drawArea = document.getElementById('drawArea');
    var table    = document.createElement('table');
    table.setAttribute('id','drawArea__table' );
    table.classList.add('drawArea__table');
    
    for (var i = 0; i < this.app.GetBoardSize(); i++){
        tr[i] = document.createElement('tr');   
        tr[i].classList.add('drawArea__table__row');
        //var td = [];
        for (var j = 0; j < this.app.GetBoardSize(); j++){
            td[j] = document.createElement('td');   
            td[j].setAttribute('id','X'+ ( i + 1 ) + 'Y' + ( j + 1 ) );
            td[j].classList.add('drawArea__table__cell');
            td[j].addEventListener('click', function(event){
                var viewElemId = event.srcElement.id;
                //set event when the cell is pressed
                self.ToggleCell(viewElemId);
            });
            tr[i].appendChild(td[j]);
        }
        table.appendChild(tr[i]);
    }
    drawArea.appendChild(table);
    
    document.getElementById('execute__proceed').disabled  = true;
    document.getElementById('generate__button').disabled  = false;

};

Controller.prototype.Proceed = function(){
    
    var _this = this.myObject;
    
    _this.StartGame();
    
};
Controller.prototype.StartGame = function(){
    
    var currentCell     = {};
    var route           = [];
    var viewElem        = {};
    
    currentCell = this.app.SetupGame();
    do{
        currentCell = this.app.ProcessCell(currentCell);
        if(currentCell){    
            //display as processed in the table view
            viewElem = document.getElementById('X' + currentCell.xPos +
                                               'Y' + currentCell.yPos);
            if (currentCell.currentWeight != 0)
            viewElem.classList.toggle('drawArea__table__cell--processed');
        }    
    }while(currentCell);
    
    this.app.isGameEnded = true;
    document.getElementById("execute__proceed").classList.add('execute__button--hidden');
    document.getElementById("execute__refresh").classList.remove('execute__button--hidden');
    document.getElementById("execute__refresh").disabled = false;
    
    if (this.app.Game.isFinishReached){
        route = this.app.GetRoute();
        for(var i = 0; i < route.length; i++){
            viewElem = document.getElementById('X' + route[i].xPos + 'Y' + route[i].yPos);
            if(route[i].remainingWeight != 0){
                viewElem.classList.add('drawArea__table__cell--route');    
            }    
            //numerate cells        
            viewElem.innerHTML = route[i].currentWeight;
        }
    }else{
        //no luck, show message;
        alert("The route can't be found!");
    }
    
};

Controller.prototype.ToggleCell = function(elemId) {
    
    if (this.app.isGameEnded == true){
        this.Refresh();
    }
    
    switch(true){ 
        case document.getElementById('drawOption__end').checked :
            this.ToggleEnds(elemId);
            break;
        case document.getElementById('drawOption__obstacle').checked :
            this.ToggleObst(elemId);
            break;
        default: //error
    }    
        
};

Controller.prototype.ToggleEnds = function(elemId){

    var cellType;
    var viewElem; 
    var viewElemOld;
    viewElem = document.getElementById(elemId);
    viewElem.classList.toggle('drawArea__table__cell--end');
    cellType = this.app.GetCellType(elemId);
    viewElemOld = this.app.UpdateEnd(elemId);
    
    //if Obstacle cell was toggled -> update css modificator
    if (cellType == this.app.cellType_Obstacle)
            viewElem.classList.toggle('drawArea__table__cell--obstacle');
    
    //Both Start and Finish have been already selected -> reset one of them
    if (viewElemOld)
        document.getElementById(viewElemOld).classList.toggle('drawArea__table__cell--end');
    
    //set property for 'Start Game' 
    document.getElementById('execute__proceed').disabled = !this.app.IsStartGameAllowed();
    
};

Controller.prototype.ToggleObst = function(elemId){

    var cellType;
    var viewElem = document.getElementById(elemId);
    viewElem.classList.toggle('drawArea__table__cell--obstacle');
    
    cellType = this.app.GetCellType(elemId);
    this.app.UpdateObst(elemId);
    if(cellType == this.app.cellType_Start ||    
       cellType == this.app.cellType_Finish){
        viewElem.classList.toggle('drawArea__table__cell--end');
        document.getElementById('execute__proceed').disabled = true;
    }
    
};

Controller.prototype.SoftRefresh = function(){
    
    this.myObject.Refresh();
    
};

Controller.prototype.Refresh = function(){    
    
    var viewElem;
    
    // clear CSS class for processed and included in  the route
    for(var i = 1; i <= this.app.GetBoardSize(); i++){
        for(var j = 1; j <= this.app.GetBoardSize(); j++){
            viewElem = document.getElementById('X' + i + 'Y' + j);
            viewElem.classList.remove('drawArea__table__cell--route', 
                                      'drawArea__table__cell--processed');
            viewElem.innerHTML = "";
        }
    }
    
    document.getElementById('execute__proceed').classList.remove('execute__button--hidden');
    document.getElementById('execute__refresh').classList.add('execute__button--hidden');
    this.app.IsGameEnded = false;
};

Controller.prototype.ShowMessage = function(message){
    
    //document.getElementById('messageBlock').innerHTML = message;
    alert(message);
};    

Controller.prototype.Generate = function(){
    
    var _this = this.myObject;
    if (_this.app)
    _this.Refresh();
    _this.SetRandomPlacement();    

};

Controller.prototype.SetRandomPlacement = function(){

    var boardSize = this.app.GetBoardSize();
    var finishCellId;
    var currentCellId;
    
    var startCellId = GetCellId(getRandomIntInclusive(1, boardSize),
                                getRandomIntInclusive(1, boardSize) );    
    this.ToggleEnds(startCellId);
    do{
        finishCellId = GetCellId(getRandomIntInclusive(1, boardSize),
                                    getRandomIntInclusive(1, boardSize) );
    }while(startCellId == finishCellId);
    this.ToggleEnds(finishCellId);
    
    for (var i = 1; i <= boardSize; i++){
        for (var j = 1; j <= boardSize; j++){
            currentCellId = GetCellId(i,j);
            if (currentCellId == startCellId || currentCellId == finishCellId)
                continue;
            // ~50/50 - obstacle or not
            var selectAsObstacle = Math.round(Math.random());
            if (selectAsObstacle){
                this.ToggleObst( GetCellId(i, j) );
            }
        }
    }

};

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//returns cell id based on board coordinates
function GetCellId(x, y){
    
    return ("X" + x + "Y" + y);
    
};

