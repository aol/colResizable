/**
    jQuery plug-in originally by Alvaro Prieto Lauroba
    Licences: MIT & GPL

    The original plugin code has been updated for better readabilty and maintenance
    Also, the parts of the plug-in that weren't used on our project have been remove

*/

(function($){   

    var activeGrip = null;
    var tables = [];
    var tableUniqueId = 0;
    
    var SIGNATURE ="aop-col-resizer";
    var FLEX = "aop-resizable-table-flex";
    var ie = navigator.userAgent.indexOf('Trident/4.0')>0;
    $("head").append("<style type='text/css'>  .aop-col-resizer{table-layout:fixed;} .aop-col-resizer td, .aop-col-resizer th{overflow:hidden;}  .aop-resizable-table-grips{ height:0px; position:relative;} .aop-resizable-table-grip{margin-left:-5px; position:absolute; z-index:5; } .aop-resizable-table-grip .aop-col-resizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px} .aop-last-resizable-table-grip{position:absolute; width:1px; } .aop-resizable-table-grip-drag{ border-left:1px dotted black;    } .aop-resizable-table-flex{width:auto!important;}</style>");
    
    /**
     * Function to allow column resizing for table objects. It is the starting point to apply the plugin.
     * @param {DOM node} tableReference - reference to the DOM table object to be enhanced
     * @param {Object} options  - some customization values
     */
    var init = function(tableReference, options) {
        var table = $(tableReference);
        table.opt = options;
        if(table.opt.disable) {
            return destroy(table);
        }
        var id = table.id = table.attr("id") || SIGNATURE+tableUniqueId++;
        if(!table.is("table") || tables[id]) {
            return;
        } 

        table.originalColumnWidths = table.opt.originalColumnWidths;
        if (table.originalColumnWidths.length == 0) {
            $.each($("th", table).filter(":visible").not(".nonResizable"), function (col) {
                table.originalColumnWidths.push($(this).width());
            });
        }
        table.addClass(SIGNATURE).attr("id", id).before('<div class="aop-resizable-table-grips"/>');
        table.grips = [];
        table.columns = [];
        table.wid = table.width();
        table.gripsContainer = table.prev();
        table.cellSpace = parseInt(ie? tableReference.cellSpacing || tableReference.currentStyle.borderSpacing :table.css('border-spacing')) || 2;  //cross-browser issues
        table.outerBorder  = parseInt(ie? tableReference.border || tableReference.currentStyle.borderLeftWidth :table.css('border-left-width')) || 1;  //cross-browser issues
        tables[id] = table;
        createGrips(table);
    };


    /**
     * This function allows to remove any enhancements performed by this plugin on a previously processed table.
     * @param {jQuery ref} table - table object
     */
    var destroy = function(table) {
        var id = table.attr("id");
        var table = tables[id];
        if(!table || !table.is("table")) {
            return;          
        }
        table.removeClass(SIGNATURE + " " + FLEX).gripsContainer.remove();
        delete tables[id];
    };

    /**
     * Function to create all the grips associated with the table given by parameters 
     * @param {jQuery ref} table - table object
     */
    var createGrips = function(table) {
    
        var thead = table.find(">thead>tr>th,>thead>tr>td").filter(":visible").not(".nonResizable");   
        table.len = thead.length;
        thead.each(function(i) {
            var column = $(this);
            var grip = $(table.gripsContainer.append('<div class="aop-resizable-table-grip"></div>')[0].lastChild);
            grip.append(table.opt.gripInnerHtml).append('<div class="'+SIGNATURE+'"></div>');

            if(i == table.len - 1) {
                if(!table.opt.enableResizeOnLastGrip || !table.opt.enableResizeOnLastGrip(table)) {
                    grip.addClass("aop-last-resizable-table-grip");
                    grip.html("");
                }     
            }

            grip.bind('touchstart mousedown', onGripMouseDown);
            grip.table = table;
            grip.i = i;
            grip.column = column;
            column.wid = (table.originalColumnWidths && table.originalColumnWidths.length>0) ? table.originalColumnWidths[i] : column.width() > 0 ? column.width() : table.opt.minWidth;
            table.grips.push(grip);
            table.columns.push(column);
            column.width(column.wid).removeAttr("width");
            grip.data(SIGNATURE, {i:i, table:table.attr("id"), last: i == table.len-1});
        });     

        if(table.opt.onColumnResized) {
            table.opt.onColumnResized(table.columns, true);
        }
        syncGrips(table);
        table.find('td, th').not(thead).not('table th, table td').each(function() {
            $(this).removeAttr('width');    //the width attribute is removed from all table cells which are not nested in other tables and dont belong to the header
        });
    };
    
    /**
     * Function that places each grip in the correct position according to the current table layout  
     * @param {jQuery ref} table - table object
     */
    var syncGrips = function(table) {
        //table.gripsContainer.width(table.wid);
        //table.len?!
        $.each(table.columns, function(i, col) {
            table.grips[i].css({
                left: col.offset().left - table.offset().left + col.outerWidth(false) + table.cellSpace / 2 + "px",
                height: table.outerHeight(false)
            });
        })  
    };
    
    /**
    * This function updates column's width according to the horizontal position increment of the grip being
    * dragged. The function can be called from the onGripDragOver
    * event handler to synchronize grip's position with their related columns.
    * @param {jQuery ref} table - table object
    * @param {number} index - index of the grip being dragged
    * @param {bool} isOver - to identify when the function is being called from the onGripDragOver event    
    */
    var syncCols = function(table, index, isOver) {
        var increase = activeGrip.x - activeGrip.left, 
            draggedCol = table.columns[index],
            nextCol = table.columns[index+1];
        var draggedColNewWidth = draggedCol.wid + increase,
            nextColNewWidth = nextCol.wid - increase;
        draggedCol.width(draggedColNewWidth + "px");
        nextCol.width(nextColNewWidth + "px");
        if(isOver) {
            draggedCol.wid = draggedColNewWidth;
            nextCol.wid = nextColNewWidth;
        }
    };

    /**
     * Event handler used while dragging a grip. It checks if the next grip's position is valid and updates it. 
     * @param {event} e - mousemove event binded to the window object
     */
    var onGripDrag = function(e) {
        if(!activeGrip) {
            return;
        }
        var table = activeGrip.table;
        var draggedCol = table.columns[activeGrip.i];
        var nextCol = table.columns[activeGrip.i + 1];
        var originalX = e.pageX;
        var x =  originalX - activeGrip.originalX + activeGrip.left;
        var minWidth = table.opt.minWidth, i = activeGrip.i;
        var l = table.cellSpace * 1.5 + minWidth + table.outerBorder;
        var last = i == table.len - 1;
        var min = i? table.grips[i - 1].position().left + table.cellSpace + minWidth: l;
        var max = (i == table.len - 1) ? table.wid - l : table.grips[i + 1].position().left - table.cellSpace - minWidth;

        x = Math.max(min, Math.min(max, x));
        activeGrip.x = x;
        activeGrip.css("left", x + "px");
        if (last) {
            activeGrip.wid = draggedCol.wid + x - activeGrip.left;
            draggedCol.width(activeGrip.wid);
            table.wid = table.width();
        } else {
            syncCols(table, i);
        }
        syncGrips(table);
        if (table.opt.onDrag) {
            e.currentTarget = table[0];
            table.opt.onDrag(e, activeGrip.i, table.columns);
        }
        return false;  //prevent text selection while dragging
    };
  

    /**
     * Event handler fired when the dragging is over, updating table layout
     */
    var onGripDragOver = function(e) {
        $(document).unbind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE)
         .unbind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE);

        $("head :last-child").remove();
        if(!activeGrip) {
            return;
        }

        activeGrip.removeClass(activeGrip.table.opt.draggingClass);
        var table = activeGrip.table;
        var index = activeGrip.i;
        var last = index == table.len - 1;
        var col = table.grips[index].column;
        if(last) {
            col.width(activeGrip.wid);
            col.wid = activeGrip.wid;
            if (table.opt.enableResizeOnLastGrip && !table.opt.enableResizeOnLastGrip(table)) {
                activeGrip.addClass("aop-last-resizable-table-grip");
                activeGrip.html("");
            }
        } else {
            syncCols(table, index, true);
        }
        syncGrips(table);
        if (table.opt.onColumnResized) {
            return table.opt.onColumnResized(table.columns); 
        }
        if(table.opt.onResize) {
            e.currentTarget = t[0];
            table.opt.onResize(e);
        }
        activeGrip = null;
    };

    /**
     * Event handler fired when the grip's dragging is about to start. Its main goal is to set up events 
     * and store some values used while dragging.
     * @param {event} e - grip's mousedown event
     */
    var onGripMouseDown = function(e) {
        var gripData = $(this).data(SIGNATURE);
        var table = tables[gripData.table],
            grip = table.grips[gripData.i];
        grip.originalX = e.pageX;
        grip.left = grip.position().left;
        $(document).bind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE, onGripDrag)
                   .bind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE, onGripDragOver);
        $("head").append("<style type='text/css'>*{cursor:" + table.opt.dragCursor + "!important}</style>");
        grip.addClass(table.opt.draggingClass);
        activeGrip = grip;
        if(table.columns[gripData.i].locked) {
            for(var i=0,col; i<table.len; i++) {
                col = table.columns[i];
                col.locked = false;
                col.wid = col.width();
            }
        }
        return false; //prevent text selection
    };

    /**
     * Event handler fired when the browser is resized. The main purpose of this function is to update
     * table layout according to the browser's size synchronizing related grips 
     */
    var onResize = function() {
        for(table in tables) {
            var table = tables[table],
                mw = 0;             
            table.removeClass(SIGNATURE);
            if (table.wid != table.width()) {
                table.wid = table.width();
                for(var i=0; i<table.len; i++) {
                    mw += table.columns[i].wid;
                }     
                for(var i=0; i<table.len; i++) {
                    table.columns[i].css("width", Math.round(1000*table.columns[i].wid/mw)/10 + "%").locked = true; 
                }
            }
            syncGrips(table.addClass(SIGNATURE));
            if(table.opt.onColumnResized) {
                return table.opt.onColumnResized(table.columns);
            }
        }
    };


    //bind resize event, to update grips position 
    $(window).bind('resize.' + SIGNATURE, onResize);


    /**
     * The plugin is added to the jQuery library
     * @param {Object} options -  an object that holds some basic customization values 
     */
    $.fn.extend({  
        colResizable: function(options) {
            var defaults = {
                draggingClass: 'aop-resizable-table-grip-drag',  //css-class used when a grip is being dragged (for visual feedback purposes)
                gripInnerHtml: '',              //if it is required to use a custom grip it can be done using some custom HTML              
                minWidth: 60,                   //minimum width value in pixels allowed for a column 
                hoverCursor: "e-resize",        //cursor to be used on grip hover
                dragCursor: "e-resize",         //cursor to be used while dragging
                disable: false,                 //disables all the enhancements performed in a previously colResized table  
                originalColumnWidths: null,   //preserve original col widths in case they are not all the same
                onDrag: null,                   //callback function to be fired during the column resizing process
                onResize: null,                 //callback function fired when the dragging process is over
                onColumnResized: null,
                enableResizeOnLastGrip: null
            }
            var options =  $.extend(defaults, options);
            return this.each(function() {
                init( this, options);
            });
        }
    });
})(jQuery);