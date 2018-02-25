$(document).ready(function() {
    /*global localStorage*/
    /*global $*/
    changeScoreboard();
    changeMode();
    
    var currentPlayer = 1;
    var mode = "hard";
    var winner;
    var boardFields = [1,2,3,4,5,6,7,8,9];
    var player1Fields = [];
    var player2Fields = [];
    var winnerGames = [
        [1,4,7],
        [2,5,8],
        [3,6,9],
        [1,2,3],
        [4,5,6],
        [7,8,9],
        [1,5,9],
        [3,5,7]
    ];
    
    $('td').click(function(e){
        $('td').addClass('avoid-clicks2');
        setTimeout(function(){
            $('td').removeClass('avoid-clicks2');
        }, 1000);
        if(($(this).text() === '')){
            $(this).animate({'opacity': 0.4}, 200, function () {
                $(this).text(currentPlayer === 1 ? 'X' : 'O');
                $(this).addClass('avoid-clicks');
            }).animate({'opacity': 1}, 200).promise().done(function(){
                winner = setFieldVar(parseInt($(this).attr('id'), 10), currentPlayer);
                if(winner){
                    $('.modal-winner .modal-title').text((currentPlayer === 1 ? '( X )' : '( O )')+' venceu!      Modo: '+(mode === "hard" ? 'Impossível' : (mode === "easy") ? 'Fácil' : 'Multiplayer'));
                    $('.modal-winner').modal('show');
                    var storage = localStorage.getItem("scoreplayer"+currentPlayer);
                    if(storage !== null){
                        storage = parseInt(storage, 10);
                        storage++;
                        localStorage.setItem("scoreplayer"+currentPlayer, storage.toString());
                    }else{
                        localStorage.setItem("scoreplayer"+currentPlayer, '1');
                        localStorage.setItem("scoreplayer"+(currentPlayer === 1 ? '2' : '1'), '0');
                    }
                    changeScoreboard();
                }else if(boardFields.length === 0){
                    $('.modal-winner .modal-title').text('Deu Velha!');
                    $('.modal-winner').modal('show');    
                }else{
                    if(currentPlayer === 1){
                        currentPlayer =  2;
                        $('.currentPlayer').text('Vez de: ( O )');
                    }else{
                        currentPlayer =  1;
                        $('.currentPlayer').text('Vez de: ( X )');
                    }
                }
                if(!e.isTrigger && !winner && mode !== "mp"){
                    triggerIA();
                }
            });
        }
    });
    
    function setFieldVar(fieldID, currentPlayer){
        if(currentPlayer === 1){
            return calcWinner(fieldID, player1Fields);
        }else{
            return calcWinner(fieldID, player2Fields);
        }     
    }
    
    function calcWinner(fieldID, playerFields){
        playerFields.push(fieldID);
        boardFields = boardFields.filter(function(f){
            if(f!== fieldID)
                return f;
        });
        
        if(playerFields.length >= 3){
            var possibleWins = filterWinnerGames(fieldID);
            var win = false;
            possibleWins.forEach(function(winnerGame){
                var matchedFields = 0;
                winnerGame.forEach(function(field){
                    if(playerFields.indexOf(field) !== -1){
                        matchedFields++;
                    }
                });
                if(matchedFields === 3){
                    win = true;
                }else if(!win){
                    matchedFields = 0;
                }
            });
            return win;
        }
    }
    
    function filterWinnerGames(fieldID){
        var possibleWins = winnerGames.map(function(winnerGame){
            if(winnerGame.indexOf(fieldID) !== -1){
                return winnerGame;
            }    
        }).filter(function(e){if(typeof e !== "undefined") return e});
        return possibleWins;
    }
    
    function clearBoard(){
        $('td').text('');  
        $('td').removeClass('avoid-clicks');
        currentPlayer =  1;
        $('.currentPlayer').text('Vez de: ( X )');
        boardFields = [1,2,3,4,5,6,7,8,9];
        player1Fields = [];
        player2Fields = [];
        
        if($('.modal-winner').hasClass('show'))
            $('.modal-winner').modal('hide');
    }
    
    $('.btn.btn-primary').click(function(){
        clearBoard(); 
    });
    
    function changeScoreboard(){
        var storage = localStorage.getItem("scoreplayer1");
        if(storage !== null){
            $('.storage').removeClass('hide').addClass('show');
            $('.nostorage').removeClass('show').addClass('hide');
            $('.score-player1').text(localStorage.getItem('scoreplayer1'));
            $('.score-player2').text(localStorage.getItem('scoreplayer2'));
        }else{
            $('.storage').removeClass('show').addClass('hide');
            $('.nostorage').removeClass('hide').addClass('show');    
        }
    }
    
    function changeMode(){
        mode = "hard";
    }
    
    $('#mode').change(changeMode());
    
    function triggerIA(){
        var idToTrigger;
        var possibleWins;
        var lastField;
        if(mode === "easy"){
            idToTrigger = boardFields[Math.floor(Math.random()*boardFields.length)];
        }else if(mode === "hard"){
            if(player1Fields.indexOf(5) === -1 && player2Fields.indexOf(5) === -1){
                idToTrigger = 5;
            }else if(player1Fields.length === 1){
                idToTrigger = Math.floor(Math.random()*4)+1;
                idToTrigger = (idToTrigger === 1) ? 1 : (idToTrigger === 2) ? 3 : (idToTrigger === 3) ? 7 : 9;   
            }else if(!searchWin()){
                lastField = player1Fields[player1Fields.length-1];
                possibleWins = filterWinnerGames(lastField);
                possibleWins.forEach(function(winnerGame){
                    var matchedFields = 0;
                    winnerGame.forEach(function(field){
                        if(player1Fields.indexOf(field) !== -1){
                            matchedFields++;
                        }
                    });
                    if(matchedFields == 2){
                        winnerGame.forEach(function(field){
                            if(player1Fields.indexOf(field) === -1 && boardFields.indexOf(field) !== -1){
                                idToTrigger = field;
                            }
                        }); 
                    }
                });
            }else{
                lastField = player2Fields[player2Fields.length-1];
                possibleWins = filterWinnerGames(lastField);
                possibleWins.forEach(function(winnerGame){
                   winnerGame.forEach(function(field){
                        if(boardFields.indexOf(field) !== -1){
                            idToTrigger = field;   
                        }
                   }); 
                });
            }
            if(idToTrigger === undefined && !winner){
                var count = 0;
                do{
                    idToTrigger = boardFields[Math.floor(Math.random()*boardFields.length)];
                    if(idToTrigger === undefined || count > boardFields.length)
                        break;
                    player2Fields.push(idToTrigger);
                    count++;
                }while(!searchWin());
                player2Fields.pop();
            }
        }     
        $('td#'+idToTrigger).trigger('click');
    }
    
    function searchWin(){
        var lastField = player2Fields[player2Fields.length-1];
        var possibleWins = filterWinnerGames(lastField); 
        var win = false;
        possibleWins.forEach(function(winnerGame){
            var matchedFields = 0;
            winnerGame.forEach(function(field){
                if(player2Fields.indexOf(field) !== -1){
                    matchedFields++;
                } 
                if(player1Fields.indexOf(field) !== -1){
                    matchedFields--;
                }
            });
            if(matchedFields == 2){
                win = true;
            }
        });
        return win;
    }
    
    $('#mobile-toggle-mp').click(function(e){
        if($('#mobile-toggle-mp').hasClass('disabled')){
            clearBoard();
        }
        $('#mobile-toggle-ia').addClass('disabled').removeClass('btn-success').addClass('btn-default');
        $(this).addClass('btn-success').removeClass('btn-default').removeClass('disabled');
        mode = "mp";
    });
    
     $('#mobile-toggle-ia').click(function(e){
        clearBoard();
        if($('#mobile-toggle-mp').hasClass('disabled')){
            mode = $(this).attr('mode');
            if(mode === "hard"){
                $(this).attr('mode', 'easy');
                $(this).text('Fácil');
                mode = "easy";
            }else{
                $(this).attr('mode', 'hard');
                $(this).text('Impossível');
                mode = "hard";
            }
        }else{
            $('#mobile-toggle-mp').addClass('disabled').removeClass('btn-success').addClass('btn-default');
            $(this).addClass('btn-success').removeClass('btn-default').removeClass('disabled');
        }
        
    });
});