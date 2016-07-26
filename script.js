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
    
    ById('boardSize__create').addEventListener('click', {
        handleEvent:ctrl.CreateTable,                  
        myObject:ctrl
        }); 
    
    ById('generate__button').addEventListener('click', {
        handleEvent:ctrl.Generate,                  
        myObject:ctrl
        }); 
    
    ById('execute__proceed').addEventListener('click', {
        handleEvent:ctrl.Proceed,                  
        myObject:ctrl
        });
    ById('execute__refresh').addEventListener('click', {
        handleEvent:ctrl.SoftRefresh,                  
        myObject:ctrl
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