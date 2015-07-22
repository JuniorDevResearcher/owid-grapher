;( function() {
	
	"use strict";

	App.Views.Form.EntitiesSectionView = Backbone.View.extend({

		el: "#form-view #data-tab .entities-section",
		events: {
			"change .countries-select": "onCountriesSelect",
			"change [name='add-country-control']": "onAddCountryControlChange"
		},

		initialize: function( options ) {
			
			this.dispatcher = options.dispatcher;
			//App.AvailableEntitiesCollection.on( "change add remove reset", this.render, this );
			//available entities are changing just on fetch so listen just for that
			App.AvailableEntitiesCollection.on( "reset fetched", this.render, this );
			
			this.$entitiesSelect = this.$el.find( ".countries-select" );
			this.$addCountryControlInput = this.$el.find( "[name='add-country-control']" );

			this.render();

		},

		render: function() {

			var $entitiesSelect = this.$entitiesSelect;
			$entitiesSelect.empty();
			
			//append default 
			$entitiesSelect.append( $( "<option selected disabled>Select entity</option>" ) );

			App.AvailableEntitiesCollection.each( function( model ) {
				$entitiesSelect.append( $( "<option value='" + model.get( "id" ) + "'>" + model.get( "name" ) + "</option>" ) );
			});

			var addCountryControl = App.ChartModel.get( "add-country-control" );
			this.$addCountryControlInput.prop( "checked", addCountryControl );

		},

		onCountriesSelect: function( evt ) {

			var $select = $( evt.target ),
				val = $select.val(),
				$option = $select.find( "option[value=" + val + "]" ),
				text = $option.text();

			App.ChartModel.addSelectedCountry( { id: val, name: text } );

		},

		onAddCountryControlChange: function( evt ) {

			var $input = $( evt.currentTarget );
			App.ChartModel.set( "add-country-control", $input.is( ":checked" ) );

		}


	});

})();