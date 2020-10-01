/** some configs */
window.max_size = 1024;

/**
 * Resizes the given file to window.max_size
 *
 * @param e
 */
window.fileChange = function (e) {
    document.getElementById('predict-file-raw').value = '';
    document.getElementById('predict-file-name').value = '';

    let file = e.target.files[0];
    if (file.type != "image/jpeg" && file.type != "image/png") {
        document.getElementById('predict-file-source').value = '';
        alert('Please only select images in JPG- or PNG-format.');
    }

    let reader = new FileReader();
    reader.onload = function (readerEvent) {
        let image = new Image();
        image.onload = function (imageEvent) {
            let w = image.width;
            let h = image.height;

            if (w > h) {
                if (w > window.max_size) {
                    h *= window.max_size / w;
                    w = window.max_size;
                }
            } else {
                if (h > window.max_size) {
                    w *= window.max_size / h;
                    h = window.max_size;
                }
            }

            let canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(image, 0, 0, w, h);

            let dataUrl;
            if (file.type == "image/jpeg") {
                dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            } else {
                dataUrl = canvas.toDataURL("image/png");
            }

            document.getElementById('predict-file-raw').value = dataUrl;
            document.getElementById('predict-file-name').value = file.name;
        };
        image.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
};

$(document).ready(function() {
    $("#predict-form").submit(function(event) {

        event.preventDefault(); //prevent default action

        let post_url = $(this).attr("action"); //get form action url
        let request_method = $(this).attr("method"); //get form GET/POST method

        let formDataObject = JSON.stringify({
            'number': $(this).find('[name="number"]').val(),
            'language': $(this).find('[name="language"]').val(),
            'output-type': $(this).find('[name="output-type"]').val(),
            'predict-file-raw': $(this).find('[name="predict-file-raw"]').val(),
            'predict-file-name': $(this).find('[name="predict-file-name"]').val(),
        });
        let formDataJson = JSON.stringify(formDataObject);

        $.ajax({
            url : post_url,
            type: request_method,
            data : formDataJson,
            contentType: 'application/json'
        }).done(function(json) {
            $('#image').attr('src', json['data']['image']['url']).css('display', 'block');
            $('#server-results').html(JSON.stringify(json, null, "\t"));
        });
    });

    let predictFileSource = document.getElementById('predict-file-source');

    if (predictFileSource !== null) {
        predictFileSource.addEventListener('change', window.fileChange, false);
    }
});