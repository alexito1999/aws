function mostrarSugerencias(data) {
    $.each(data.productos, (index, elem) => {
      var newElem = $(`
      <li class="lista"><i class="bi bi-chevron-right"></i>${elem.nombre}</li>
      `);
      $(".sugerencias").append(newElem);
    });
  
    $(".input-search").on('click', function() {
      $(".sugerencias").show();
    });
  
    $(document).on('click', function(event) {
      if (!$(event.target).closest('.input-search').length) {
        $(".sugerencias").hide();
      }
    });
  
    $(".input-search").on('click', function() {
      if ($(".input-search").val().length > 0) {
        $(".sugerencias").show();
      }
    });
  
    $(".sugerencias").on('click', '.lista', function() {
      var nombre = $(this).text();
      $(".input-search").val(nombre);
      $(".sugerencias").hide();
    });
  
    $(".box-input-sugerencias").on('focusout', function() {
      $(".sugerencias").hide();
    });
  
    $(".input-search").on('keyup', function() {
      var input = $(this).val().toLowerCase();
      if (input === "") {
        $(".sugerencias").hide();
      } else {
        $(".sugerencias").show();
        $(".lista").each(function() {
          var nombre = $(this).text().toLowerCase();
          if (nombre.includes(input)) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });
      }
    });
  }