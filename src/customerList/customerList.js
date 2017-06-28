    // Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
angular.module('gcpt-my-customers.config', [])
    .value('gcpt-my-customers.config', {
        debug: true
    });

// Modules
angular.module('gcpt-my-customers.directives', []);
angular.module('gcpt-my-customers.filters', []);
angular.module('gcpt-my-customers.services', []);
angular.module('gcpt-my-customers',
    [    
        'ngSanitize',
        'gcpt-my-customers.config',
        'gcpt-my-customers.directives',
        'gcpt-my-customers.filters',
        'gcpt-my-customers.services',
        'ng',
        'ngAria',
        'ngAnimate',
        'ngMaterial'
    ]);
