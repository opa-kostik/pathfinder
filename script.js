//HTML Events
window.addEventListener('load', function () {
    
    var ctrl = new Controller();
    
    var elem = document.getElementById('boardSize');
    elem.addEventListener("keydown", function(event){
        if (event.keyCode == 13) document.getElementById('boardSize__create').click();
    });
    elem.addEventListener("keypress", function(event){
        return event.charCode >= 48 && event.charCode <= 57;
    });
    
    document.getElementById('boardSize__create').addEventListener('click', {
        handleEvent:ctrl.CreateTable,                  
        myObject:ctrl
        }); 
    
    document.getElementById('execute__proceed').addEventListener('click', {
        handleEvent:ctrl.Proceed,                  
        myObject:ctrl
        });
    document.getElementById('execute__refresh').addEventListener('click', {
        handleEvent:ctrl.SoftRefresh,                  
        myObject:ctrl
        });
    //disable drag and drop features to avoid hovering effects
    document.getElementById('drawArea').addEventListener('dragstart', function(event){
        event.preventDefault(); 
        return false;
    });
    document.getElementById('drawArea').addEventListener('drop', function(event){
        event.preventDefault(); 
        return false;
    });    
});
