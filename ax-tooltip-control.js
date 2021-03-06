/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'jquery',
   'bootstrap/tooltip'
], function( ng, $ ) {
   'use strict';

   var directiveName = 'axTooltip';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var directive = [ function() {

      return {
         restrict: 'A',
         link: function( scope, element, attrs ) {
            var tooltipPositionInterval = null;
            var $element = $( element[ 0 ] );

            // Workarounds to prevent a sticky tooltip on navigation
            var $container = $( '<div></div>' );

            $element.tooltip( {
               title: function() {
                  return scope.$eval( attrs[ directiveName ] );
               },
               container: $container
            } );

            var toolTipShowing = false;
            scope.$watch( attrs[ directiveName ], function( newTitle ) {
               if( toolTipShowing ) {
                  $element.tooltip( {
                     title: newTitle,
                     container: $container
                  } );
                  $element.tooltip( 'show' );
               }
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            scope.$on( '$destroy', function() {
               clearInterval( tooltipPositionInterval );
               try {
                  $element.tooltip( 'destroy' );
                  $container.remove();
               }
               catch( e ) {
                  // Ignore. DOM node has been destroyed before the directive.
               }
               $element.off( 'show.bs.tooltip' );
               $element.off( 'hidden.bs.tooltip' );

               // Cleanup after bootstrap's tooltip. Otherwise it leaks data set via jQuery.data
               $element.remove();
               $container = null;
               $element = null;
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            // Handling for moving anchor element
            $element
               .on( 'shown.bs.tooltip', function() {
                  if( tooltipPositionInterval !== null ) { return; }
                  var lastElementPosition = element.offset();
                  var lastElementPositionString = lastElementPosition.left + '_' + lastElementPosition.top;
                  tooltipPositionInterval = setInterval( function() {
                     var newPosition = element.offset();
                     var newPositionString = newPosition.left + '_' + newPosition.top;

                     if( lastElementPositionString !== newPositionString ) {
                        element.tooltip( 'show' );
                     }
                     lastElementPosition = newPosition;
                     lastElementPositionString = newPositionString;
                  }, 200 );

               } )
               .on( 'hide.bs.tooltip', function() {
                  clearInterval( tooltipPositionInterval );
                  tooltipPositionInterval = null;
               } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            // Workarounds to prevent a sticky tooltip on navigation
            $element.on( 'show.bs.tooltip', function() {
               $container.appendTo( 'body' );
               toolTipShowing = true;
            } );

            $element.on( 'hidden.bs.tooltip', function() {
               toolTipShowing = false;
               $container.detach();
            } );

            scope.$on( '$locationChangeSuccess', function() {
               try {
                  $container.detach();
               }
               catch( e ) {
                  // Ignore. DOM node has been destroyed before the event occurred.
               }
            } );
         }
      };
   } ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( directiveName + 'Control', [] ).directive( directiveName, directive );

} );
