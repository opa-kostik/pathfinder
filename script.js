//HTML Events
window.addEventListener('load', function () {
    
    var ctrl = new Controller();
    
    var elem = ById('boardSize');
    elem.addEventListener("keydown", function(event){
        if (event.keyCode == 13) ById('boardSize__create').click();
    });
    elem.addEventListener("keypress", function(event){
        return event.charCode >= 48 && event.charCode <= 57;
    });
    
    ById('boardSize__create').addEventListener('click', 
        function(){ 
            ctrl.CreateTable();
    }); 
    
    ById('generate__button').addEventListener('click', 
        function(){ 
            ctrl.Generate();
    }); 
    
    ById('execute__proceed').addEventListener('click', 
        function(){ 
            ctrl.StartGame();
    });
    ById('execute__refresh').addEventListener('click', 
        function(){ 
            ctrl.Refresh();
    });
    //disable drag and drop features to avoid hovering effects
    ById('drawArea').addEventListener('dragstart', function(event){
        event.preventDefault(); 
        return false;
    });
    ById('drawArea').addEventListener('drop', function(event){
        event.preventDefault(); 
        return false;
    });    
});


//helper functions
function ById(elemId){
    return document.getElementById(elemId);
}

function CreateElem(tagName){
    return document.createElement(tagName);
}    