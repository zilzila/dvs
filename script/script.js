const storageAvailable = localStorageAvailable();
let portraitOrientation;
let $grid;
let touchTime = 0;

$(function(){
    $grid = $('.grid.main');

    $('#breadcrumb-ok, #breadcrumb-twitch').on('click', function(){
        const streamId  = this.getAttribute('id');
        const streamSrc = this.getAttribute('href')
            .replace('&parent=twitch.tv', '&parent=' + document.location.hostname);

        setStorage('streamId', streamId);
        setStorage('streamSrc', streamSrc);

        applyStreamSetings(streamId, streamSrc);

        return false;
    });

    $('.container.chat').resizable({
        handles: "e",
        resize: function (event, ui){
            ui.position.left = 0;
        },
        start: function (){
            $grid.addClass('resizing');
        },
        stop: function (event, ui){
            setStorage('chatWidth', ui.size.width);
            $grid.removeClass('resizing');
        }
    });

    $('.container.stream').resizable({
        handles: "s",
        resize: function (event, ui){
            ui.position.bottom = 0;
        },
        start: function (){
            $grid.addClass('resizing');
        },
        stop: function (){
            $grid.removeClass('resizing');
        }
    });

    $grid.on('click', '.container.chat .ui-resizable-handle', function(){
        if (((new Date().getTime()) - touchTime) < 500) {
            $grid.toggleClass('chat-right');

            setStorage('chatRight', $grid.hasClass('chat-right') ? 1 : '');

            applyChatSettings('', $grid.hasClass('chat-right'))
        }
        touchTime = new Date().getTime();
    });

    // Обработчик двойного клика
    // (в jQuery нет обработчика dblclick для сенсорных устройств)
    $grid.on("click", '.container.stream .ui-resizable-handle', function() {
        if (((new Date().getTime()) - touchTime) < 500) {
            $grid.find('.container.stream').css('height', '');
        }
        touchTime = new Date().getTime();
    });

    // Create the query list.
    const mediaQueryList = window.matchMedia("(orientation: portrait)");

    // Define a callback function for the event listener.
    function handleOrientationChange(e) {
        portraitOrientation = e.matches;
        applyChatSettings();
        applyStreamSetings();
    }

    // Run the orientation change handler once.
    handleOrientationChange(mediaQueryList);

    // Add the callback function as a listener to the query list.
    mediaQueryList.addEventListener('change', handleOrientationChange);
});

function localStorageAvailable() {
    let storage;
    try {
        storage = window['localStorage'];
        const x = 'test';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function setStorage(key, value) {
    if (storageAvailable){
        localStorage.setItem(key, value);
    }
}

function applyChatSettings(width, right){
    const $chat = $('.container.chat');
    const $stream = $('.container.stream');

    if (portraitOrientation) {
        $chat.resizable('disable');
        $chat.css('width', '');

        $stream.resizable('enable');
        $grid.removeClass('chat-right');
    }else{
        $stream.resizable('disable');
        $stream.css('height', '');

        let chatWidth = width;
        let chatRight = right;

        if (storageAvailable){
            chatWidth = localStorage.getItem('chatWidth');
            chatRight = localStorage.getItem('chatRight');
        }

        if (chatRight){
            $grid.addClass('chat-right');
        }

        $chat.resizable('enable');
        $chat.resizable('option', 'handles', chatRight ? 'w' : 'e');

        if (chatWidth){
            $chat.width(chatWidth);
        }
    }
}

function applyStreamSetings(id, src){
    let streamId = id;
    let streamSrc = src;

    if (storageAvailable){
        streamId = localStorage.getItem('streamId') ?? 'breadcrumb-ok';
        streamSrc = localStorage.getItem('streamSrc');
    }

    if (streamId){
        $('#' + streamId).addClass('active').parent().siblings().find('a').removeClass('active');
    }

    const $streamFrame = $('.container.stream iframe');

    if (streamSrc && streamSrc !== $streamFrame.attr('src')){
        $streamFrame.attr('src', streamSrc);
    }
}
