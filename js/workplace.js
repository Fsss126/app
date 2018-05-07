var cardHtml = '<div class="demo-card-event mdl-card mdl-shadow--2dp mdl-cell--12-col-phone mdl-cell--4-col-tablet mdl-cell mdl-cell--3-col">\n' +
    '                <div class="mdl-card__title mdl-card--expand">\n' +
    '                    <div class="indicator" percent="0"></div>\n' +
    '                    <div class="shadow"></div>\n' +
    '                    <p></p>\n' +
    '                </div>\n' +
    '                <div class="mdl-card__actions mdl-card--border">\n' +
    '                    <a class="mdl-card__title"></a>\n' +
    '                    <div class="mdl-layout-spacer"></div>\n' +
    '                    <div class="note-options">\n' +
    '                        <!--TODO add custom ids-->\n' +
    '                        <button id="note-options12" class="note-options-button mdl-button mdl-js-button mdl-button--icon">\n' +
    '                            <i class="material-icons">more_vert</i>\n' +
    '                        </button>\n' +
    '                        <ul class="mdl-menu mdl-menu--top-right mdl-js-menu" for="note-options12">\n' +
    '                            <li class="test-op mdl-menu__item">Test knowledge</li>\n' +
    '                            <li class="mark-op mdl-menu__item">Mark as learned</li>\n' +
    '                            <li class="edit-op mdl-menu__item">Edit</li>\n' +
    '                            <li class="delete-op mdl-menu__item">Delete</li>\n' +
    '                        </ul>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        ';

var apikey = 'c1b28824-ccd0-41e2-9efa-4b07b4d031b5';
var streamer;
var is_listening;
var note_text;
var snackbarContainer;

var popup;
var openedNote;
var noteToDelete;

$(document).ready(function () {
    $('.mdl-layout__header').css('overflow-y','unset');
    if (window.location.hash == '')
    {
        $('[href="#all"]').addClass('is-selected');
        $('#all').addClass('is-selected');
    }
    else {
        $('[href="' + window.location.hash + '"]').addClass('is-selected');
        $(window.location.hash).addClass('is-selected');
    }

    snackbarContainer = document.getElementById('snackbar');
    popup = $('.cd-view-popup');

    setTimeout(function () {
        $('.mdl-layout__drawer-button').each(function () {
            console.log('e');
            $(this).on('click',function () {
                $('.mdl-layout__drawer').toggleClass('opened');
                $('.mdl-layout__content').toggleClass('opened');
            });
        });
    }, 500);

    //open popup on note click
    wireEvents();

    //close popup
    popup.on('click', function (e) {
        var target = $(e.target);
        if (target.prop('tagName') !== 'I')
            $('.note-title .note-options').removeClass('show');
        if (target.hasClass('cd-view-popup'))
        {
            popup.toggleClass('is-visible').removeClass('edit').removeClass('test');
            popup.find('[chosen=true]').removeAttr('chosen');
        }
    });
    //popup menu on small devices
    $('#more-vert').on('click', function () {
        $('.note-title .note-options').toggleClass('show');
    });
    //add new note
    $('#add-button').on('click',function () {
        // $('.page-content').append(s);
        // componentHandler.upgradeDom();
        // wireEvents();
        openNote(null);
        edit();
        popup.toggleClass('is-visible');
    });
    $('#popup-edit').on('click',function () {
        edit();
    });
    $('#edit-save').on('click',function () {
        //TODO add ajax query
        var note_text_content = popup.find('.note-text').val();
        var note_title = popup.find('.note-title input').val();
        var empty = false;
        if (note_text_content == '')
        {
            popup.find('.note-text').addClass('empty-field');
            empty = true;
        }
        if (note_title == '')
        {
            popup.find('.note-title input').addClass('empty-field');
            empty = true;
        }
        if (!empty) //fulfill saving
        {
            if (openedNote != null) //save changes in existing note
            {
                //TODO add ajax query
                popup.find('.note-title input').attr('disabled','disabled');
                popup.find('.note-text').attr('disabled','disabled');
                openedNote.find('.mdl-card__title p').html(note_text_content).attr('text-align',popup.find('.note-text').attr('text-align'));
                openedNote.find('.mdl-card__actions .mdl-card__title').html(note_title);
                popup.removeClass('edit');
                popup.find('[chosen=true]').removeAttr('chosen');
            }
            else {
                //TODO add ajax query
                var new_card = $(cardHtml);
                //TODO set unique id
                new_card.find('.mdl-card__title p').html(note_text_content).attr('text-align',popup.find('.note-text').attr('text-align'));
                new_card.find('.mdl-card__actions .mdl-card__title').html(note_title);
                $('.page-content').prepend(new_card);
                componentHandler.upgradeDom();
                wireEvents();
                popup.toggleClass('is-visible').removeClass('edit').removeClass('test');
                popup.find('[chosen=true]').removeAttr('chosen');
            }
        }
    });
    $('#edit-cancel').on('click',function () {
        if (openedNote != null)
        {
            var note_text_content = openedNote.find('.mdl-card__title p');
            var note_title = openedNote.find('.mdl-card__actions .mdl-card__title');
            popup.find('.note-title input').val(note_title.text().trim());
            popup.find('.note-text').val(note_text_content.html()).attr('text-align', note_text_content.attr('text-align'));
            popup.find('.note-title input').attr('disabled','disabled');
            popup.find('.note-text').attr('disabled','disabled');
            popup.removeClass('edit');
            popup.find('[chosen=true]').removeAttr('chosen');
        }
        else  {
            popup.toggleClass('is-visible').removeClass('edit').removeClass('test');
            popup.find('[chosen=true]').removeAttr('chosen');
        }
    });
    $('#popup-mark').on('click', function () {
        //TODO add ajax query
        setIndicator(openedNote.find('.indicator').attr('percent','100'));
        setTimeout(function () {
            openedNote.find('.mark-op').remove();
        }, 100);
    });
    $('#popup-delete').on('click', function () {
        //TODO add ajax query
        deleteNote(openedNote);
        popup.toggleClass('is-visible').removeClass('edit').removeClass('test');
        popup.find('[chosen=true]').removeAttr('chosen');
    });
    $('#popup-test').on('click', function () {
        if (streamer == null)
            streamer = new ya.speechkit.SpeechRecognition();
        window.ya.speechkit.settings.apikey = apikey;
        is_listening = false;
        test();
    });
    $('#mic').on('click', function () {
        if (is_listening == false) //start listening
        {
            $(this).html('<i class="material-icons">mic</i>');
            is_listening = true;
            streamer.start({
                initCallback: function () {
                    $('#mic').attr('chosen', 'true').addClass('pulse-button').parent().attr('data-balloon','Pause listening');
                    snackbarContainer.MaterialSnackbar.showSnackbar({message: 'You can start dictation'});
                },
                dataCallback: function (text, done) {
                    console.log("Text: " + text);
                    console.log("Done:" + done);
                    if (done)
                    {
                        popup.find('.note-text').val(popup.find('.note-text').val() + text);
                    }
                },
                errorCallback: function (err) {
                    console.log("Error: " + err);
                    snackbarContainer.MaterialSnackbar.showSnackbar({message: 'An error occured during dictation'});
                    $('#mic').removeClass('pulse-button').removeAttr('chosen').html('<i class="material-icons">mic_none</i>').parent().attr('data-balloon','Dictate');
                },
                stopCallback: function () {
                    console.log("Stopped");
                    $('#mic').removeClass('pulse-button').removeAttr('chosen').html('<i class="material-icons">mic_none</i>').parent().attr('data-balloon','Dictate');
                },
                particialResults: true,
                utteranceSilence: 60
            });
        }
        else //pause listening
        {
            is_listening = false;
            $(this).html('<i class="material-icons">mic_none</i>').removeAttr('chosen').removeClass('pulse-button');
            $(this).parent().attr('data-balloon','Dictate');
            streamer.pause();
        }
    });
    $('#test-cancel').on('click',function () {
        var note_text_content = openedNote.find('.mdl-card__title p');
        var note_title = openedNote.find('.mdl-card__actions .mdl-card__title');
        popup.find('.note-title input').val(note_title.text().trim());
        popup.find('.note-text').val(note_text_content.html()).attr('text-align', note_text_content.attr('text-align'));
        popup.find('.note-title input').attr('disabled','disabled');
        popup.find('.note-text').attr('disabled','disabled').attr('placeholder', 'Text');
        popup.removeClass('test');
        streamer.abort();
    });
    $('#test-restart').on('click',function () {
        streamer.abort();
        popup.find('.note-text').val('');
    });
    $('#text-align-center').on('click', function () {
        popup.find('.note-text').attr('text-align', 'center');
        $(this).attr('chosen','true');
        $('#text-align-left').removeAttr('chosen');
    });
    $('#text-align-left').on('click', function () {
        popup.find('.note-text').attr('text-align', 'left');
        $(this).attr('chosen','true');
        $('#text-align-center').removeAttr('chosen');
    });
    $('[href="#all"]').on('click',function () {
        $('.mdl-navigation__link').removeClass('is-selected');
        $(this).addClass('is-selected');
        $('.page-content').removeClass('is-selected');
        $('#all').addClass('is-selected');
    });
    $('[href="#inprocess"]').on('click',function () {
        $('.mdl-navigation__link').removeClass('is-selected');
        $(this).addClass('is-selected');
        $('.page-content').removeClass('is-selected');
        $('#inprocess').addClass('is-selected');
    });
    $('[href="#learned"]').on('click',function () {
        $('.mdl-navigation__link').removeClass('is-selected');
        $(this).addClass('is-selected');
        $('.page-content').removeClass('is-selected');
        $('#learned').addClass('is-selected');
    });
});

function setIndicator(indicator) {
    var percent = indicator.attr('percent');
    indicator.attr('data-balloon', 'Progress: ' + percent + '%');
    indicator.attr('data-balloon-pos', 'left');
    if (percent == 100)
    {
        indicator.html('<i class="material-icons">check_circle</i>\n'+ '<svg x="0px" y="0px" viewBox="0 0 36 36">\n' +
            '                            <circle fill="none" cx="18" cy="18" r="16" transform="rotate(-90 18 18)"></circle>\n' +
            '                        </svg>');
    }
    else {
        var n = 100 - percent;
        indicator.html('<svg x="0px" y="0px" viewBox="0 0 36 36">\n' +
            '                            <circle fill="none" cx="18" cy="18" r="16" stroke-dasharray="100 100" stroke-dashoffset="' + n + '" transform="rotate(-90 18 18)"></circle>\n' +
            '                        </svg>')
    }
}

function wireEvents() {
    $('.mdl-card:not(.wired-to-events) .indicator').each(function () {
        setIndicator($(this));
    });
    $('.mdl-card:not(.wired-to-events)').on('click',function (e) {
        var target = $(e.target);
        if (target.parents('.note-options').length == 0 && !target.hasClass('indicator'))
        {
            openNote($(this));
            popup.toggleClass('is-visible');
        }
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.edit-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        openNote(target);
        edit();
        popup.toggleClass('is-visible');
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.delete-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        deleteNote(target);
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.mark-op:not(.wired-to-events)').on('click',function () {
        //TODO add ajax query
        var target = $(this).parents('.mdl-card');
        setIndicator(target.find('.indicator').attr('percent', '100'));
        setTimeout(function () {
            target.find('.mark-op').remove();
        }, 100);
    }).each(function () {
        $(this).addClass('wired-to-events');
    });

    $('.test-op:not(.wired-to-events)').on('click',function () {
        var target = $(this).parents('.mdl-card');
        openNote(target);
        test();
        popup.toggleClass('is-visible');
    })
}

function openNote(noteCard) {
    openedNote = noteCard;
    if (openedNote != null)
    {
        var note_text_content = openedNote.find('.mdl-card__title p');
        var note_title = openedNote.find('.mdl-card__actions .mdl-card__title');
        popup.find('.note-title input').val(note_title.text().trim());
        popup.find('.note-text').val(note_text_content.html()).attr('text-align', note_text_content.attr('text-align'));
    }
    else {
        popup.find('.note-title input').val('');
        popup.find('.note-text').val('').attr('text-align', 'left');
    }
}

function deleteNote(noteCard) {
    noteToDelete = noteCard;
    noteToDelete.addClass('hidden');
    snackbarContainer.MaterialSnackbar.showSnackbar({
        message: 'Note was deleted',
        timeout: 3000,
        actionHandler: function () {
            noteToDelete.removeClass('hidden');
            noteToDelete = null;
            $(snackbarContainer).removeClass('mdl-snackbar--active');
        },
        actionText: 'Undo'
    });
    setTimeout(function () {
       if (noteToDelete != null)
       {
           //TODO add ajax query
           noteToDelete.remove();
       }
    }, 3000);
}

function edit() {
    popup.addClass('edit');
    popup.find('.note-title input').removeAttr('disabled');
    popup.find('.note-text').removeAttr('disabled');
    popup.find('#text-align-' + popup.find('.note-text').attr('text-align')).attr('chosen', 'true');
}

function test() {
    popup.addClass('test');
    popup.find('.note-text').val('').removeAttr('disabled').attr('placeholder','Type text here');
}

function checkDictation() {
    
}
