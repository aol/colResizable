![alt text](http://bacubacu.com/colresizable/githubLogo.png "colResizable jQuery plugin")

# colResizable

colResizable is a free jQuery plugin designed to enhance any kind of HTML table object adding column resizing features by dragging column anchors manually.

## Features
colResizable was developed since no other similar plugin with the below listed features was found:

* Compatibility with both percentage and pixel-based table layouts
* Column resizing not altering total table width 
* No external resources needed (such as images or stylesheets)
* Customization of column anchors
* Small footprint
* Cross-browser compatibility (IE7+, Chrome, Safari, Firefox)
* Events


## Usage
To use this plugin a script reference must be added to the aopColResizable.js file in the head section of the document once jQuery is loaded. To enhance a table (or collection of tables) point it with a jQuery wrapper and apply the colResizable() method. 

    $(function(){
      $("table").colResizable();
    });


## Attributes

* **innerGripHtml**: [type: string] [default: empty string] [version: 1.0] 

Its purpose is to allow column anchor customization by defining the HTML to be used in the column grips to provide some visual feedback. It can be used in a wide range of ways to obtain very different outputs, and its flexibility can be increased by combining it with the draggingClass attribute.
___

* **draggingClass**: [type: string] [default: internal css class] [version: 1.0] 

This attribute is used as the css class assigned to column anchors while being dragged. It can be used for visual feedback purposes.

___
* **disable**: [type: boolean] [default: false] [version: 1.0] 

When set to true it aims to remove all previously added enhancements such as events and additional DOM elements assigned by this plugin to a single or collection of tables. It is required to disable a previously colResized table prior its removal from the document object tree.

___
* **minWidth**: [type: number] [default: 15] [version: 1.1] 

This value specifies the minimum width (measured in pixels) that is allowed for the columns.
___

* **hoverCursor**: [type: string] [default: "e-resize"] [version: 1.3] 

This attribute can be used to customize the cursor that will be displayed when the user is positioned on the column anchors.
___

* **dragCursor**: [type: string] [default: "e-resize"] [version: 1.3] 

Defines the cursor that will be used while the user is resizing a column.
___

* **originalColumnWidths**: [type: array] [default: null]

The user can pass an array of columns widths which will be prioritized if set.
 
## Events

* **onResize**: [type: callback function] [default: null] [version: 1.0] 

If a callback function is supplied it will be fired when the user has ended dragging a column anchor altering the previous table layout. The callback function can obtain a reference to the updated table through the currentTarget attribute of the event retrieved by parameters

___
* **onDrag**: [type: callback function] [default: null] [version: 1.1] 

This event is fired while dragging a column anchor if liveDrag is enabled. It can be useful if the table is being used as a multiple range slider. The callback function can obtain a reference to the updated table through the currentTarget attribute of the event retrieved by parameters

___

* **onColumnResized**: [type: callback function] [default: null]

If a callback function is supplied it will be fired when the user has ended dragging a column anchor altering the previous table layout. The callback returns an array of the updated table column headers

___

* **enableResizeOnLastGrip**: [type: callback function] [default: null]

If a callback function is supplied it will be fired when the user has ended dragging a column anchor altering the previous table layout. If the callback returns true the last column is resizable
