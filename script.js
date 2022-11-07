const storageAvailable = localStorageAvailable();

$(document).ready(function(){
    $('#breadcrumb-ok, #breadcrumb-twitch').click(function(){
        let href = this.getAttribute('href');
        // Замена parent у twitch
        href = href.replace('&parent=twitch.tv', '&parent=' + document.location.hostname);
        $('.container.stream iframe').attr('src', href);

        setStorage('streamId', this.getAttribute('id'));
        setStorage('streamSrc', href);

        $(this).addClass('active').parent().siblings().find('a').removeClass('active');

        return false;
    });

    $('.container.chat').resizable({
        handles: "e",
        resize: function (event, ui){
            ui.position.left = 0;
        },
        stop: function (event, ui){
            setStorage('chatWidth', ui.size.width);
        }
    });

    // Загрузка сохранённых настроек из локального хранилища
    if (storageAvailable){
        // Применение настроек чата
        const $chat = $('.container.chat');
        const chatWidth = localStorage.getItem('chatWidth');
        if (parseInt(chatWidth) > 0){
            $chat.width(chatWidth);
        }

        const chatRight = localStorage.getItem('chatRight');
        if (chatRight){
            $('.grid.main').addClass('chat-right');
            $chat.resizable('option', 'handles', 'w');
        }

        // Применение настроек стрима
        const streamId = localStorage.getItem('streamId') ?? 'breadcrumb-ok';
        $('#' + streamId).addClass('active');

        const streamSrc = localStorage.getItem('streamSrc');
        if (streamSrc){
            $('.container.stream iframe').attr('src', streamSrc);
        }
    }

    $('.grid.main').on('dblclick', '.container.chat .ui-resizable-handle', function(){
        const $grid = $('.grid.main');
        $grid.toggleClass('chat-right');

        $('.container.chat').resizable('option', 'handles', $grid.hasClass('chat-right') ? 'w' : 'e');

        setStorage('chatRight', $grid.hasClass('chat-right') ? 1 : '');
    })
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