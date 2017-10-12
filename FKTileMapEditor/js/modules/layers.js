define(["jquery-ui"], function($) {

	var Layers = {}, Editor;

	Layers.initialize = function(namespace) {

		Editor = namespace;

		// Layer UI functionality
		$("#layerlist").on("mousedown", "li", function(e) {
			$("#layerlist li").removeClass("active");
			$(e.currentTarget).addClass("active");
		})

		.on("click", "li span:first-child", this.toggle_visibility)
		.on("click", "li span:last-child", this.open_contextmenu);

		$("body").on("click", "#layer-clear", this.clear);
		$("body").on("click", "#layer-rename", this.rename);
		$("body").on("click", "#layer-remove", this.remove);

		$("#layers_add").on("click", this.add);

		// Dismiss Contextmenu
		$("body").on("mousedown", function(e) {
			if ($(e.target).parent().attr("id") != "contextmenu") {
				if ($("body #contextmenu").length)
				{ $("body #contextmenu").remove(); }
			}
		});

		// Make layers sortable
		$("#layerlist").sortable({
			axis: "y",
			mouseButton: 1,
			appendTo: document.body,
			update: this.sortByIndex,
			containment: "#layers > div"
		});

		// Add predefined layers
		this.add(null, "background");
		this.add(null, "world");

		return this;
	};

	Layers.add = function(e, name) {

		var id = 0, ids = [];

		if ($("#layerlist li").length) {
			$("#layerlist li").each(function() { ids.push(+this.getAttribute("data-id")); });
			while (ids.indexOf(id) != -1) { id++; }
		}

		if (!name) { name = window.prompt("新图层名称:  仅允许数字，大小写字母，下划线"); }
		if (!name || !name.match(/^[a-zA-Z_-][a-zA-Z0-9_-]{2,}$/)) {
			if (name) { alert("名称过短或者非法!"); }
			return;
		}

		$("#layerlist li").removeClass("active");
		$("#layerlist").append("<li class='active' data-id='" + id + "'><span class='icon-eye-open'></span> " + name + "<span class='icon-cog'></span></li>");
		$("#layerlist").sortable("refresh");

		// Create and append an associated layer div inside the canvas
		$("#tiles").append("<div class='layer' data-name='" + name + "' data-id='" + id + "'></div>");
		Layers.sortByIndex();
	};

	Layers.remove = function(id) {

		var name = $(Layers.contextTarget).text().trim(),
		    id = $(Layers.contextTarget).attr("data-id");

		if (confirm("Remove \"" + name + "\" ?")) {

			// TODO make this possible?
			if ($("#layerlist li").length == 1) {
				alert("Cannot remove last layer!");
				return;
			}

			$(Layers.contextTarget).remove();
			$("#contextmenu").remove();
			$(".layer[data-id=" + id + "]").remove();
		}
	};

	Layers.clear = function(e) {

		var name = $(Layers.contextTarget).text().trim(),
		    id = $(Layers.contextTarget).attr("data-id");

		if (confirm("Remove all tiles from \"" + name + "\" ?")) {
			$(".layer[data-id=" + id + "]").html("").attr({
				"data-tileset": "",
				"class": "layer"
			});

			$("#contextmenu").remove();
		}
	};

	Layers.rename = function(e) {

		var name = $(Layers.contextTarget).text().trim(),
		    id = $(Layers.contextTarget).attr("data-id"),
		    new_name = prompt("Enter new name for \"" + name + "\":");

		if (!new_name || new_name.length < 3) {
			if (new_name) { alert("Name too short!"); }
			return;
		}

		// Rename associated div too
		$(".layer[data-id=" + id + "]").attr("data-name", new_name);

		// Create and append a new layer element to the toolbar
		$(Layers.contextTarget).html("<span class='icon-eye-open'></span> " + new_name + "<span class='icon-cog'></span>");
		$("#contextmenu").remove();
	};

	Layers.get_active = function() {

		var id = $("#layerlist li.active").attr("data-id");

		return { 
			id: $("#layerlist li.active").attr("data-id"),
			elem: $(".layer[data-id=" + id + "]")[0]
		}
	};

	// TODO Switch z-index while sorting
	Layers.sortByIndex = function(e, ui) {

		var id, drag_name = ui ? $(ui.item).children().val() : "";

		$("#layerlist li").each(function(i) {
			id = $(this).attr("data-id");
			$(".layer[data-id=" + id + "]").css("z-index", i);
		});
	};

	Layers.toggle_visibility = function(e) {

		var visible = $(e.currentTarget).hasClass("icon-eye-open"),
		    className = visible ? "icon-eye-close" : "icon-eye-open",
		    id = $(e.currentTarget).parent().attr("data-id");

		$(e.currentTarget).attr("class", "icon " + className);
		$(".layer[data-id=" + id + "]").toggle(!visible);
	};

	Layers.open_contextmenu = function(e) {

		Layers.contextTarget = $(e.currentTarget).parent();

		$.get("templates/cm_layer.tpl", function(data) {
			$("body").append(data);
			$("#contextmenu").css("left", e.pageX);
			$("#contextmenu").css("top", e.pageY);
		});
	};

	return Layers;
});