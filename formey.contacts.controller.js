angular.module("contacts", [{ // grid view plugin
    name: "trNgGrid",
    files: ["/Scripts/trNgGrid.js", "/Content/trNgGrid.css"]
},
{ // used in add/edit contact details
    name: "toggle-switch",
    files: ["/Scripts/angular-toggle-switch.min.js"]
},
{ //used for CSV Export
    name: "ngCsv",
    files: ["/Scripts/ng-csv.js"],
}])


//////======== CONTACTS GRID ACTION/S CONTROLLER ============//////////
// FUNCTIONS
// ---------
// onServerSideItemsRequested() - get contacts grid data
// exportCSVModal() - export grid to CSV
// contactDetails() - gets contact details
// addNote() - add note/s to a contact
// deleteItem() - delete contact
// onboarding - display a guide to the page

.controller('ContactsCtrl',
            ['$scope', '$http', 'datacontext', '$modal', '$filter', '$rootScope', 'submitValuesService',  //  '$filter',, '$compile', '$sce', '$modal', '$filter', '$timeout', 
    function ($scope, $http, datacontext, $modal, $filter, $rootScope, submitValuesService) { // , $filter $compile, $sce, $modal, $filter, $timeout, datacontext, $routeParams,

        $scope.currentPage = "";
        $scope.pageItems = "";
        $scope.filterBy = "";
        $scope.filterByFields = "";
        $scope.orderBy = "";
        $scope.orderByReverse = "";

        $scope.addNote = addNote;
        $scope.addContact = addContact;
        $scope.endEdit = endEdit;
        $scope.deleteItem = deleteItem;

        $scope.contactItems = [];
        $scope.contactInfo = [];
        $scope.contactItem = [];

        //////======== GET CONTACTS GRID DATA ============//////////

        $scope.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
            $scope.currentPage = currentPage;
            $scope.pageItems = pageItems;
            $scope.filterBy = filterBy;
            $scope.filterByFields = filterByFields;
            $scope.orderBy = orderBy;
            $scope.orderByReverse = orderByReverse;
            var filter = "";
            if (filterBy != null) { // setup search filter for grid
                filter = "&$filter=" +
                "substringof('" + filterBy + "', CRM_FirstName) eq true or " +
                "substringof('" + filterBy + "', CRM_LastName) eq true or " +
                "substringof('" + filterBy + "', CRM_AccountName) eq true or " +
                "substringof('" + filterBy + "', CRM_Phone) eq true or " +
                "substringof('" + filterBy + "', CRM_Mobile) eq true or " +
                "substringof('" + filterBy + "', CRM_Email) eq true or " +
                "substringof('" + filterBy + "', CRM_Website) eq true or " +
                "substringof('" + filterBy + "', CRM_Description) eq true or " +
                "substringof('" + filterBy + "', CRM_Street) eq true or " +
                "substringof('" + filterBy + "', CRM_Suburb) eq true or " +
                "substringof('" + filterBy + "', CRM_State) eq true or " +
                "substringof('" + filterBy + "', CRM_Postcode) eq true or " +
                "substringof('" + filterBy + "', CRM_Country) eq true"
            }

            var qryOrderBy = "&$orderby=CRM_DateAdded desc";
            var qryOrderByReverse = "";
            if (orderBy != null) {

                if (orderByReverse == true) {
                    qryOrderByReverse = ' desc';
                }
                else
                    qryOrderByReverse = ' asc';

                qryOrderBy = '&$orderby=' + orderBy + qryOrderByReverse

            }
            //http://localhost:49431/breeze/Field/contacts?$skip=5&$top=2&$orderby=CRM_DateAdded
            //'&$select=ContactId,UserId,CRM_Title,CRM_FirstName,CRM_LastName,CRM_AccountName,CRM_AccountType,CRM_Phone,CRM_Mobile,CRM_Email,CRM_Website,CRM_Description,CRM_Street,CRM_Suburb,CRM_State,CRM_Postcode,CRM_Country,CRM_LeadSource,CRM_Opportunity,Priority,Starred,Viewed,CRM_DateAdded' +   
            $http.get('/breeze/Field/contacts?$inlinecount=allpages' +
                 '&$skip=' + (currentPage * pageItems) +
                 '&$top=' + pageItems +
                 qryOrderBy +
                 filter, { cache: false }).success(function (response) {

                     $scope.myPageItemsCount = 10;
                     $scope.myItemsTotalCount = response.InlineCount;
                     // $scope.submissionList = response.Results;
                     $scope.contactItems = response.Results;

                     for (var i = 0 ; i < $scope.contactItems.length; i++) {
                         $scope.contactItems[i].CRM_DateAdded = new Date($scope.contactItems[i].CRM_DateAdded);
                     }
                 });
        }
       
        //////======== EXPORT CONTACTS TO CSV ============//////////

        $scope.exportCSVModal = function () {
            $scope.loading = true;
            $http.get('/breeze/Field/Contacts')
                    .then(
                        function (submitValues) {
                            $scope.allcontacts = [];
                            // ADD 1st ROW
                            var el = {};
                            el.CRM_Opportunity = "Opportunity";
                            el.Priority = "Priority";
                            el.CRM_LeadSource = "Lead Source";
                            el.CRM_DoNotCall = "Do Not Call";
                            el.CRM_AccountName = "Account Name";
                            el.CRM_Email = "Email";
                            el.CRM_Title = "Title";
                            el.CRM_FirstName = "First Name";
                            el.CRM_LastName = "Last Name";
                            el.CRM_Phone = "Phone";
                            el.CRM_Mobile = "Mobile";

                            el.CRM_Street = "Street";
                            el.CRM_Suburb = "Suburb";
                            el.CRM_State = "State";
                            el.CRM_Postcode = "Postcode";
                            el.CRM_Country = "Country";
                            el.CRM_Website = "Website";
                            el.CRM_DateAdded = "Date Added";

                            $scope.allcontacts.push(el);

                            for (var i = 0 ; i < submitValues.data.length; i++) {
                                var el = {};
                                el.CRM_Opportunity = submitValues.data[i].CRM_Opportunity;
                                el.Priority = submitValues.data[i].Priority;
                                el.CRM_LeadSource = submitValues.data[i].CRM_LeadSource;
                                el.CRM_DoNotCall = submitValues.data[i].CRM_DoNotCall;
                                el.CRM_AccountName = submitValues.data[i].CRM_AccountName;
                                el.CRM_Email = submitValues.data[i].CRM_Email;
                                el.CRM_Title = submitValues.data[i].CRM_Title;
                                el.CRM_FirstName = submitValues.data[i].CRM_FirstName;
                                el.CRM_LastName = submitValues.data[i].CRM_LastName;
                                el.CRM_Phone = submitValues.data[i].CRM_Phone;
                                el.CRM_Mobile = submitValues.data[i].CRM_Mobile;

                                el.CRM_Street = submitValues.data[i].CRM_Street;
                                el.CRM_Suburb = submitValues.data[i].CRM_Suburb;
                                el.CRM_State = submitValues.data[i].CRM_State;
                                el.CRM_Postcode = submitValues.data[i].CRM_Postcode;
                                el.CRM_Country = submitValues.data[i].CRM_Country;
                                el.CRM_Website = submitValues.data[i].CRM_Website;
                                el.CRM_DateAdded = $filter('date')(submitValues.data[i].CRM_DateAdded, $scope.globalItems.dateFormat);
                                $scope.allcontacts.push(el);
                            }

                            $scope.loading = false;
                        }
                    );
            var myOtherModal = $modal({ scope: $scope, template: 'app/contacts/contacts.export.modal.html', show: true });
        }

        function getUTC() {
            var now = new Date();
            var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
            return now_utc;
        }

        //////======== ADD A NEW CONTACT  ============//////////

        function addContact() {

            var contactItem = datacontext.createContactItem();
            contactItem.userId = gId;
            contactItem.cRM_DateAdded = new Date().getTime();// getUTC();
            datacontext.saveEntity(contactItem)
                .fail(addFailed)
                .fin(refreshView);
            $scope.globalItems.contactsUnreadCount = $scope.globalItems.contactsUnreadCount + 1;
            endEdit($scope.globalItems);
            $scope.onServerSideItemsRequested($scope.currentPage, $scope.pageItems, $scope.filterBy, $scope.filterByFields, $scope.orderBy, $scope.orderByReverse);
            $scope.contactInfo = contactItem;

            var myOtherModal = $modal({ scope: $scope, template: 'app/contacts/formey.contacts.modal.html', show: true });
        }

        //////======== ADD NOTE TO CONTACT ============//////////

        function addNote(tid) {

            var noteItem = datacontext.createContactNote();
            noteItem.userId = $scope.contactInfo.userId;
            noteItem.contactId = tid;
            noteItem.dateAdded = new Date().getTime();//getUTC();
            $scope.onServerSideItemsRequested($scope.currentPage, $scope.pageItems, $scope.filterBy, $scope.filterByFields, $scope.orderBy, $scope.orderByReverse);
            datacontext.saveEntity(noteItem)
                .fail(addFailed)
                .fin(refreshView);
        }
        function addFailed(error) {
            console.log("add failed");
            console.log(error);
            failed({ message: "Save of new field failed" });
        }

        //////======== DELETE CONTACT DETAILS ============//////////

        function deleteItem(_field) {

            if (typeof _field.notes != 'undefined') { // check that we are deleting a form item NOT a form item element
                if (_field.notes.length > 0) {
                    for (var i = 0 ; i <= _field.notes.length; i++) {
                        datacontext.deleteFieldItem(_field.notes[0])
                       .fail(addFailed);
                    }
                }
            }

            datacontext.deleteFieldItem(_field)
                .fail(addFailed)
                .fin(refreshView);
            //currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse
            $scope.onServerSideItemsRequested($scope.currentPage, $scope.pageItems, $scope.filterBy, $scope.filterByFields, $scope.orderBy, $scope.orderByReverse);

            function addFailed(error) {
                console.log(error);
                failed({ message: "Delete of field failed" });
            }
        };

        $scope.showRelated = function (relatedVal) {
            if (relatedVal != null && relatedVal != 0)
                return true
            else
                return false
        }

        //////======== GET CONTACT DETAILS ============//////////

        $scope.contactDetails = function (gridItem) {
            $scope.getContact = getContact;
            $scope.getContact();
            gridItem.Viewed = true;
            $scope.relatedToSubmissionId = "";

            //#region private functions 
            function getContact() {
                datacontext.getContact(gridItem.ContactId)
                    .then(getSucceeded).fail(failed);//.fin(refreshView);
            }

            function getSucceeded(data) {
                $scope.contactInfo = data[0];
                $scope.relatedToSubmissionId = $scope.contactInfo.relatedToSubmissionId;
                if ($scope.contactInfo.relatedToSubmissionId != null && $scope.contactInfo.relatedToSubmissionId != 0) { //get submission details
                    submitValuesService.getSubmitValues($scope.contactInfo.relatedToSubmissionId) //gridItem.SubmissionId
                   .then(
                       function (submitValues) {
                           $scope.submitValue = submitValues[0];
                           $scope.CreateDate = new Date($scope.submitValue.Date);
                       }
                   );
                }

                //$scope.loading = false;
                var myOtherModal = $modal({ scope: $scope, template: 'app/contacts/formey.contacts.modal.html', show: true });
                if (!$scope.contactInfo.viewed) { //check if viewed first time
                    $scope.globalItems.contactsUnreadCount = $scope.globalItems.contactsUnreadCount - 1;
                    $scope.contactInfo.viewed = true;
                    endEdit($scope.contactInfo);
                    endEdit($scope.globalItems);
                }
            }
            function failed(error) {
                $scope.error = error.message;
            }
        };

        // ===================== ONBOARDING AND HELP DROPDOWN =================
        $rootScope.showTour = false;

        // listen for the event in the relevant $scope
        $rootScope.$on('myOnboardingEvent', function (event, data) {
            $scope.startOnboarding();
        });

        $scope.onboardingEnabled = false;

        $scope.onboardingSteps = [
            {
                title: "CRM",
                position: "centered",
                description: "The CRM lets you see your customer opportunities.",
                width: 300
            },
             {
                 title: "Add a CRM Contact",
                 position: "right",
                 description: "Clicking the green plus button will launch a pop-up where you can add your CRM Contact details.",
                 attachTo: "#addContact",
                 position: "left"
             }
        ];

        // ===================== REFRESH GRID VIEW AND SEND CHANGES =================

        function refreshView() {
            $scope.$apply();
        }
        function endEdit(entity) {
            $scope.onServerSideItemsRequested($scope.currentPage, $scope.pageItems, $scope.filterBy, $scope.filterByFields, $scope.orderBy, $scope.orderByReverse);
            datacontext.saveEntity(entity).fin(refreshView);
        }
    }

            ])

//========= DIRECTIVE TO CONFIRM DELETE ===========//

.directive('confirmationNeeded', function () {
    return {
        priority: 1,
        terminal: true,
        link: function (scope, element, attr) {
            var msg = attr.confirmationNeeded || "Are you sure?";
            var clickAction = attr.ngClick;
            element.bind('click', function () {
                if (window.confirm(msg)) {
                    scope.$eval(clickAction)
                }
            });
        }
    };
})

.run(function () {
    TrNgGrid.tableCssClass = "tr-ng-grid table table-hover";
});