'use strict';

angular.module('ydsApp', ['ngSanitize'])
.controller('YdsController', function($scope, $window, slideStorage) {
    var vm = this;
    vm.currentImage = 0;
    vm.selectedText = -1;
    vm.isContentEditable = false;
    vm.shows = slideStorage.index();
    vm.showOpenMenu = false;
    vm.closeMenus = function(e) {
        var ignore = ['dropdown-item', 'menubar-item dropdown'];
        if(ignore.indexOf(e.target.className) === -1) {
            vm.showOpenMenu = false;
        }
    };
    vm.slideshow = {
        name: 'Test',
        slides: [
            {
                imageUrl:'http://thumb7.shutterstock.com/display_pic_with_logo/64260/292334429/stock-photo-hospital-profession-people-and-medicine-concept-group-of-happy-doctors-at-hospital-292334429.jpg',
                text: [
                    {size: 50, top: 30, left: 30, color: 'green', content: 'We\'re very smart.'},
                    {size: 50, top: 300, left: 30, color: 'green', content: 'But we hate Harold!'}
                ]
            },
            {
                imageUrl:'http://thumb9.shutterstock.com/display_pic_with_logo/1357345/139099052/stock-photo-happy-doctor-man-showing-heart-shape-139099052.jpg',
                text: [
                    {rot: 0, size: 50, top: 30, left: 30, color: 'green', content: 'My heart is this big.'},
                    {rot: 10, size: 50, top: 300, left: 30, color: 'green', content: 'But I still fucking hate Harold!'}
                ]
            }
        ]
    }; 
    vm.slides = vm.slideshow.slides;
    vm.editTitle = function() {
        var newName = $window.prompt('Enter YDS title:', vm.slideshow.name);
        if(newName !== null || newName !== '') {
            vm.slideshow.name = newName;
        }
    };
    vm.setCurrentImage = function(idx) {
        vm.selectedText = -1;
        vm.currentImage = idx;
    };
    vm.editText = function(idx, e) {
        $(e.target).draggable({
            containment: $('.editor')
        }).on('dragstop', function() {
            var top = e.target.style.top.replace('px', '');
            var left = e.target.style.left.replace('px', '');
            vm.slides[vm.currentImage].text[vm.selectedText].top = top;
            vm.slides[vm.currentImage].text[vm.selectedText].left = left;
        });
        vm.selectedText = idx;
    };
    vm.clearSelection = function(e) {
        if(e.target.className==='current-image' || e.target.className==='editor') {
            vm.selectedText = -1;
            vm.isContentEditable = false;
            $('.ui-draggable').draggable('destroy');
        }
    };
    vm.isColor = function(c) {
        if(vm.selectedText > -1) {
            return vm.slides[vm.currentImage].text[vm.selectedText].color === c;
        }
        return false;
    };
    vm.setColor = function(c) {
        vm.slides[vm.currentImage].text[vm.selectedText].color = c;
    };
    vm.addSlide = function() {
        var imageUrl = $window.prompt('Enter new image URL:');
        if(imageUrl !== null) {
            vm.slides.push({
                imageUrl: imageUrl,
                text: []
            });
        }
    };
    vm.addText = function(e) {
        $window.getSelection().empty();
        if(e.target.className==='current-image') {
            vm.slides[vm.currentImage].text.push({
                size: 50, 
                top: e.offsetY, 
                left: e.offsetX, 
                color: 'red', 
                content: 'Harold is the worst.'
            });
            vm.selectedText = vm.slides[vm.currentImage].text.length - 1;
            vm.isContentEditable = true;

        }
    };

    vm.save = function() {
        slideStorage.save(vm.slideshow);
    };

    vm.load = function(show) {
        var newSlides = slideStorage.load(show.key);
        vm.slideshow = newSlides;
        vm.slides = vm.slideshow.slides;
        vm.currentImage = 0;
    };

    vm.newyds = function() {
        vm.slideshow = {
            name: null,
            slides: []
        };
        vm.slides = vm.slideshow.slides;
    };

    $('.sidebar').on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $('.sidebar').on('dragenter', function(e) {
        $(this).toggleClass('drop-target');
        e.preventDefault();
        e.stopPropagation();
    }).on('dragleave', function(e) {
        $(this).toggleClass('drop-target');
        e.preventDefault();
        e.stopPropagation();
    });


    $('.sidebar').on('drop', function(e) {
        $(this).toggleClass('drop-target');
        e.preventDefault();
        e.stopPropagation();
        var dt = e.originalEvent.dataTransfer;
        var dropped = $(dt.getData('text/html'))[0];
        if(dropped.tagName === 'IMG') {
            vm.slides.push({
                imageUrl: $(dropped).attr('src'),
                text: []
            });
            $scope.$apply();
        }
    });

    $('.sidebar-images').sortable({
        start: function(e, u) {
            vm.slideImageFrom = u.item.index();
        },
        stop: function(e, u) {
            var tgt;
            vm.slideImageTo = u.item.index();
            tgt = vm.slides.splice(vm.slideImageFrom, 1)[0];
            vm.slides.splice(vm.slideImageTo, 0, tgt);
        }
    });

    return vm;
})
.directive('contenteditable', function($sce) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {val: '=val'},
        link: function(scope, el, attrs, ngModel) {
            if(!ngModel) {return;}
            function read() {
                var html = scope.val;
                if(attrs.stripBr && html === '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
                ngModel.$render();
            }

            ngModel.$render = function() {
                el.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
            };

            el.on('blur keyup change', function(){
                scope.val = el.html();
                scope.$evalAsync(read);
            });
            read();
        }
    };
})
.factory('slideStorage', function($window) {
    var slides = {};
    var prefix = 'yds';
    slides.canSave = function() {
        try {
            var storage = $window.localStorage;
            var x = '__storage__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch(e) {
            return false;
        }
    };

    slides.save = function(val) {
        var key;
        if(slides.canSave()) {
            if(!val.hasOwnProperty('key')) {
                key = [prefix, slides.index().length].join('-');
                val.key = key;
            }
            $window.localStorage.setItem(val.key, JSON.stringify(val));
        }
    };

    slides.load = function(name) {
        if(slides.canSave()) {
            return JSON.parse($window.localStorage.getItem(name));
        }
    };

    slides.index = function() {
        if(slides.canSave()) {
            var s = [];
            var o;
            for(var i in $window.localStorage) {
                if(i.indexOf('yds-') > -1) {
                    o = JSON.parse($window.localStorage.getItem(i));
                    o.key = i;
                    s.push(o);
                }
            }
            return s;
        }
    };

    slides.remove = function(name) {
        if(slides.canSave()) {
            $window.localStorage.removeItem(name);
        }
    };

    return slides;
});
