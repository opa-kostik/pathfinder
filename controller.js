function Controller(){
    
    this.app = {};    
}

Controller.prototype.CreateTable = function(){
    
    var _this = this.myObject;
    try{
        _this.InitView();    
        _this.DrawTable();
    }catch(err){
        alert(err);
    }    
    
};

Controller.prototype.InitView = function(){
    
    var size = Number(ById('boardSize').value);
    var drawArea = ById('drawArea');

    this.app = new App(size);
    
    var table = ById('drawArea__table');
    if (table) 
        drawArea.removeChild(table);
    
};

Controller.prototype.DrawTable = function(){
    
    
    var table    = CreateElem('table');
    table.setAttribute('id','drawArea__table' );
    table.classList.add('drawArea__table');
    
    var tr = [];
    var td = [];
    for (var i = 0; i < this.app.GetBoardSize(); i++){
         tr[i] = CreateElem('tr');   
        tr[i].classList.add('drawArea__table__row');
        //var td = [];
        for (var j = 0; j < this.app.GetBoardSize(); j++){
            td[j] = CreateElem('td');   
            td[j].setAttribute('id','X'+ ( i + 1 ) + 'Y' + ( j + 1 ) );
            td[j].classList.add('drawArea__table__cell');
            
            var self = this;
            td[j].addEventListener('click', function(event){
                var viewElemId = event.srcElement.id;
                //set event when the cell is pressed
                self.ToggleCell(viewElemId);
            });
            tr[i].appendChild(td[j]);
        }
        table.appendChild(tr[i]);
    }
    var drawArea = ById('drawArea');
    drawArea.appendChild(table);
    
    var elem = ById('execute__proceed');
    elem.classList.remove('execute__button--hidden');
    elem.disabled = true;
    
    elem = ById("execute__refresh")
    elem.classList.add('execute__button--hidden');
    
    elem = ById('generate__button')
    elem.disabled  = false;

};

Controller.prototype.Proceed = function(){
    
    var _this = this.myObject;
    
    _this.StartGame();
    
};
Controller.prototype.StartGame = function(){
    
    var currentCell = this.app.SetupGame();
    do{
        currentCell = this.app.ProcessCell(currentCell);
        if(currentCell){    
            //display as processed in the table view
            viewElem = ById('X' + currentCell.xPos +
                                               'Y' + currentCell.yPos);
            if (currentCell.currentWeight != 0)
            viewElem.classList.toggle('drawArea__table__cell--processed');
        }    
    }while(currentCell);
    
    this.app.isGameEnded = true;
    var elem = ById("execute__proceed");
    elem.classList.add('execute__button--hidden');
    elem.disabled = true;
    
    elem = ById("execute__refresh")
    elem.classList.remove('execute__button--hidden');
    
    
    
    if (this.app.Game.isFinishReached){
        var viewElem        = {};
        var route = this.app.GetRoute();
    
        for(var i = 0; i < route.length; i++){
            viewElem = ById('X' + route[i].xPos + 'Y' + route[i].yPos);
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
        case ById('drawOption__end').checked :
            this.ToggleEnds(elemId);
            break;
        case ById('drawOption__obstacle').checked :
            this.ToggleObst(elemId);
            break;
        default: //error
    }    
        
};

Controller.prototype.ToggleEnds = function(elemId){

    var viewElem = ById(elemId);
    viewElem.classList.toggle('drawArea__table__cell--end');
    
    var cellType = this.app.GetCellType(elemId);
    var viewElemOld = this.app.UpdateEnd(elemId);
    
    //if Obstacle cell was toggled -> update css modificator
    if (cellType == this.app.cellType_Obstacle)
            viewElem.classList.toggle('drawArea__table__cell--obstacle');
    
    //Both Start and Finish have been already selected -> reset one of them
    if (viewElemOld)
        ById(viewElemOld).classList.toggle('drawArea__table__cell--end');
    
    //set property for 'Start Game' 
    ById('execute__proceed').disabled = !this.app.IsStartGameAllowed();
    
};

Controller.prototype.ToggleObst = function(elemId){

    var viewElem = ById(elemId);
    viewElem.classList.toggle('drawArea__table__cell--obstacle');
    
    var cellType = this.app.GetCellType(elemId);
    this.app.UpdateObst(elemId);
    if(cellType == this.app.cellType_Start ||    
       cellType == this.app.cellType_Finish){
        viewElem.classList.toggle('drawArea__table__cell--end');
        ById('execute__proceed').disabled = true;
    }
    
};

Controller.prototype.SoftRefresh = function(){
    
    this.myObject.Refresh();
    
};

Controller.prototype.Refresh = function(){    
    
    var elem;
    
    // clear CSS class for processed and included in  the route
    for(var i = 1; i <= this.app.GetBoardSize(); i++){
        for(var j = 1; j <= this.app.GetBoardSize(); j++){
            elem = ById('X' + i + 'Y' + j);
            elem.classList.remove('drawArea__table__cell--route', 
                                      'drawArea__table__cell--processed');
            elem.innerHTML = "";
        }
    }
    
    elem = ById('execute__proceed');
    elem.classList.remove('execute__button--hidden');
    elem.disabled = false;
    
    elem = ById('execute__refresh')
    elem.classList.add('execute__button--hidden');
    this.app.IsGameEnded = false;
};

Controller.prototype.Generate = function(){
    
    var _this = this.myObject;
    
    _this.Refresh();
    _this.SetRandomPlacement();    

};

Controller.prototype.SetRandomPlacement = function(){

    var boardSize = this.app.GetBoardSize();
    var startCellId = GetCellId(getRandomIntInclusive(1, boardSize),
                                getRandomIntInclusive(1, boardSize) );    
    this.ToggleEnds(startCellId);
    do{
        var finishCellId = GetCellId(getRandomIntInclusive(1, boardSize),
                                     getRandomIntInclusive(1, boardSize) );
    }while(startCellId == finishCellId);
    this.ToggleEnds(finishCellId);
    
    for (var i = 1; i <= boardSize; i++){
        for (var j = 1; j <= boardSize; j++){
            var currentCellId = GetCellId(i,j);
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

