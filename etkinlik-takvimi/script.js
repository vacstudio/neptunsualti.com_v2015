! function() {

    var today = moment();

    function Calendar(selector, events) {
        this.el = document.querySelector(selector);
        this.events = events;
        this.current = moment().date(1);
        this.events.forEach(function(ev) {
            ev.date = moment(ev.date);
        });
        this.draw();
        var current = document.querySelector('.today');
        if (current) {
            var self = this;
            window.setTimeout(function() {
                self.openDay(current);
            }, 500);
        }

    }

    Calendar.prototype.draw = function() {
        //Create Header
        this.drawHeader();

        //Draw Month
        this.drawMonth();

        this.drawLegend();
    }

    Calendar.prototype.drawHeader = function() {
        var self = this;
        if (!this.header) {
            //Create the header elements
            this.header = createElement('div', 'header');
            this.header.className = 'header';

            this.title = createElement('h1');

            var right = createElement('div', 'right');
            right.addEventListener('click', function() { self.nextMonth(); });

            var left = createElement('div', 'left');
            left.addEventListener('click', function() { self.prevMonth(); });

            //Append the Elements
            this.header.appendChild(this.title);
            this.header.appendChild(right);
            this.header.appendChild(left);
            this.el.appendChild(this.header);
        }

        this.title.innerHTML = this.current.format('MMMM YYYY');
    }

    Calendar.prototype.drawMonth = function() {
        var self = this;


        if (this.month) {
            this.oldMonth = this.month;
            this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
            this.oldMonth.addEventListener('webkitAnimationEnd', function() {
                self.oldMonth.parentNode.removeChild(self.oldMonth);
                self.month = createElement('div', 'month');
                self.backFill();
                self.currentMonth();
                self.fowardFill();
                self.el.appendChild(self.month);
                window.setTimeout(function() {
                    self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
                }, 16);
            });
        } else {
            this.month = createElement('div', 'month');
            this.el.appendChild(this.month);
            this.backFill();
            this.currentMonth();
            this.fowardFill();
            this.month.className = 'month new';
        }
    }

    Calendar.prototype.backFill = function() {
        var clone = this.current.clone();
        var dayOfWeek = clone.day();

        if (!dayOfWeek) { return; }

        clone.subtract('days', dayOfWeek + 1);

        for (var i = dayOfWeek; i > 0; i--) {
            this.drawDay(clone.add('days', 1));
        }
    }

    Calendar.prototype.fowardFill = function() {
        var clone = this.current.clone().add('months', 1).subtract('days', 1);
        var dayOfWeek = clone.day();

        // if(dayOfWeek === 6) { return; }
        if (dayOfWeek === 7 || dayOfWeek === 0) { return; }

        for (var i = dayOfWeek; i < 7; i++) { // 6 --> 7 
            this.drawDay(clone.add('days', 1));
        }
    }

    Calendar.prototype.currentMonth = function() {
        var clone = this.current.clone();

        while (clone.month() === this.current.month()) {
            this.drawDay(clone);
            clone.add('days', 1);
        }
    }

    Calendar.prototype.getWeek = function(day) {
        if (!this.week || day.day() === 1) { // 0 --> 1 || 0 pazar, 1 pazartesi, 2 salı ...
            this.week = createElement('div', 'week');
            this.month.appendChild(this.week);
        }
    }

    Calendar.prototype.drawDay = function(day) {
        var self = this;
        this.getWeek(day);

        //Outer Day
        var outer = createElement('div', this.getDayClass(day));
        outer.addEventListener('click', function() {
            self.openDay(this);
        });

        //Day Name
        var name = createElement('div', 'day-name', day.format('ddd'));

        //Day Number
        var number = createElement('div', 'day-number', day.format('DD'));


        //Events
        var events = createElement('div', 'day-events');
        this.drawEvents(day, events);

        outer.appendChild(name);
        outer.appendChild(number);
        outer.appendChild(events);
        this.week.appendChild(outer);
    }

    Calendar.prototype.drawEvents = function(day, element) {
        if (day.month() === this.current.month()) {
            var todaysEvents = this.events.reduce(function(memo, ev) {
                if (ev.date.isSame(day, 'day')) {
                    memo.push(ev);
                }
                return memo;
            }, []);

            todaysEvents.forEach(function(ev) {
                var evSpan = createElement('span', ev.color);
                element.appendChild(evSpan);
            });
        }
    }

    Calendar.prototype.getDayClass = function(day) {
        classes = ['day'];
        if (day.month() !== this.current.month()) {
            classes.push('other');
        } else if (today.isSame(day, 'day')) {
            classes.push('today');
        }
        return classes.join(' ');
    }

    Calendar.prototype.openDay = function(el) {
        var details, arrow;
        var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
        var day = this.current.clone().date(dayNumber);

        var currentOpened = document.querySelector('.details');

        //Check to see if there is an open detais box on the current row
        if (currentOpened && currentOpened.parentNode === el.parentNode) {
            details = currentOpened;
            arrow = document.querySelector('.arrow');
        } else {
            //Close the open events on differnt week row
            //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
            if (currentOpened) {
                currentOpened.addEventListener('webkitAnimationEnd', function() {
                    currentOpened.parentNode.removeChild(currentOpened);
                });
                currentOpened.addEventListener('oanimationend', function() {
                    currentOpened.parentNode.removeChild(currentOpened);
                });
                currentOpened.addEventListener('msAnimationEnd', function() {
                    currentOpened.parentNode.removeChild(currentOpened);
                });
                currentOpened.addEventListener('animationend', function() {
                    currentOpened.parentNode.removeChild(currentOpened);
                });
                currentOpened.className = 'details out';
            }

            //Create the Details Container
            details = createElement('div', 'details in');

            //Create the arrow
            var arrow = createElement('div', 'arrow');

            //Create the event wrapper

            details.appendChild(arrow);
            el.parentNode.appendChild(details);
        }

        var todaysEvents = this.events.reduce(function(memo, ev) {
            if (ev.date.isSame(day, 'day')) {
                memo.push(ev);
            }
            return memo;
        }, []);

        this.renderEvents(todaysEvents, details);

        arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 32 + 'px';
    }

    Calendar.prototype.renderEvents = function(events, ele) {
        //Remove any events in the current details element
        var currentWrapper = ele.querySelector('.events');
        var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

        events.forEach(function(ev) {
            var div = createElement('div', 'event');
            var square = createElement('div', 'event-category ' + ev.color);
            var span = createElement('span', '', ev.eventName);
            // var span = createElement('span', '', '<a href="' + ev.eventURL + '" target="_blank">' + ev.eventName + '</a>');

            div.appendChild(square);
            div.appendChild(span);
            wrapper.appendChild(div);
        });

        if (!events.length) {
            var div = createElement('div', 'event empty');
            var span = createElement('span', '', 'Herhangi bir etkinlik bulunmamaktadır :(');

            div.appendChild(span);
            wrapper.appendChild(div);
        }

        if (currentWrapper) {
            currentWrapper.className = 'events out';
            currentWrapper.addEventListener('webkitAnimationEnd', function() {
                currentWrapper.parentNode.removeChild(currentWrapper);
                ele.appendChild(wrapper);
            });
            currentWrapper.addEventListener('oanimationend', function() {
                currentWrapper.parentNode.removeChild(currentWrapper);
                ele.appendChild(wrapper);
            });
            currentWrapper.addEventListener('msAnimationEnd', function() {
                currentWrapper.parentNode.removeChild(currentWrapper);
                ele.appendChild(wrapper);
            });
            currentWrapper.addEventListener('animationend', function() {
                currentWrapper.parentNode.removeChild(currentWrapper);
                ele.appendChild(wrapper);
            });
        } else {
            ele.appendChild(wrapper);
        }
    }

    Calendar.prototype.drawLegend = function() {
        var legend = createElement('div', 'legend');
        var calendars = this.events.map(function(e) {
            return e.calendar + '|' + e.color;
        }).reduce(function(memo, e) {
            if (memo.indexOf(e) === -1) {
                memo.push(e);
            }
            return memo;
        }, []).forEach(function(e) {
            var parts = e.split('|');
            var entry = createElement('span', 'entry ' + parts[1], parts[0]);
            legend.appendChild(entry);
        });
        this.el.appendChild(legend);
    }

    Calendar.prototype.nextMonth = function() {
        this.current.add('months', 1);
        this.next = true;
        this.draw();
    }

    Calendar.prototype.prevMonth = function() {
        this.current.subtract('months', 1);
        this.next = false;
        this.draw();
    }

    window.Calendar = Calendar;

    function createElement(tagName, className, innerText) {
        var ele = document.createElement(tagName);
        if (className) {
            ele.className = className;
        }
        if (innerText) {
            ele.innderText = ele.textContent = innerText;
        }
        return ele;
    }
}();

! function() {
    var data = [
        { date: '2017-02-18', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sivas Buz Dalışı Turu', eventURL: 'http://www.nevcan.com/' },
        { date: '2017-02-19', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sivas Buz Dalışı Turu' },
        { date: '2017-03-18', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Çanakkale Şehitliği Kültür Turu' },
        { date: '2017-03-19', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kabatepe Dalış Turu' },
        { date: '2017-04-22', calendar: 'Gezi / Tur', color: 'blue', eventName: 'İbrice Dalış Turu' },
        { date: '2017-04-23', calendar: 'Gezi / Tur', color: 'blue', eventName: 'İbrice Dalış Turu' },
        { date: '2017-04-29', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kaş Dalış Turu' },
        { date: '2017-04-30', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kaş Dalış Turu' },
        { date: '2017-05-01', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kaş Dalış Turu' },
        { date: '2017-05-19', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kemer Dalış Turu' },
        { date: '2017-05-20', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kemer Dalış Turu' },
        { date: '2017-05-21', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kemer Dalış Turu' },
        { date: '2017-06-10', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Eskişehir Dalış Turu' },
        { date: '2017-06-11', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Eskişehir Kültür Turu' },
        { date: '2017-06-24', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kıbrıs Dalış Turu' },
        { date: '2017-06-25', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kıbrıs Dalış Turu' },
        { date: '2017-06-26', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Kıbrıs Dalış Turu' },
        { date: '2017-07-01', calendar: 'Gezi / Tur', color: 'blue', eventName: 'U-20 Batık Dalışı Turu' },
        { date: '2017-07-08', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Karaburun (İzmir) Dalış Turu' },
        { date: '2017-07-09', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Karaburun (İzmir) Dalış Turu' },
        { date: '2017-07-22', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Ayvalık Dalış Turu' },
        { date: '2017-07-23', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Ayvalık Dalış Turu' },
        { date: '2017-08-05', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Fethiye Dalış Turu' },
        { date: '2017-08-06', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Fethiye Dalış Turu' },
        { date: '2017-08-26', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sharm El-Shake Dalış Turu' },
        { date: '2017-08-27', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sharm El-Shake Dalış Turu' },
        { date: '2017-08-28', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sharm El-Shake Dalış Turu' },
        { date: '2017-08-29', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sharm El-Shake Dalış Turu' },
        { date: '2017-08-30', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sharm El-Shake Dalış Turu' },
        { date: '2017-08-31', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sharm El-Shake Dalış Turu' },
        { date: '2017-09-01', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Sharm El-Shake Dalış Turu' },
        { date: '2017-09-16', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Halfeti Batık Şehir Dalış Turu' },
        { date: '2017-09-17', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Halfeti Kültür Turu' },
        { date: '2017-10-07', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Bodrum Dalış Turu' },
        { date: '2017-10-08', calendar: 'Gezi / Tur', color: 'blue', eventName: 'Bodrum Dalış Turu' },

        // Teorik Eğitim
        { date: '2017-03-11', calendar: 'Teorik Eğitim', color: 'yellow', eventName: '1* Dalıcı Teorik Eğitimi' },
        { date: '2017-03-12', calendar: 'Teorik Eğitim', color: 'yellow', eventName: '1* Dalıcı Teorik Eğitimi' },
        { date: '2017-03-25', calendar: 'Teorik Eğitim', color: 'yellow', eventName: '2* Dalıcı Teorik Eğitimi' },
        { date: '2017-03-26', calendar: 'Teorik Eğitim', color: 'yellow', eventName: '2* Dalıcı Teorik Eğitimi' },
        { date: '2017-04-01', calendar: 'Teorik Eğitim', color: 'yellow', eventName: '3* Dalıcı Teorik Eğitimi' },
        { date: '2017-04-02', calendar: 'Teorik Eğitim', color: 'yellow', eventName: '3* Dalıcı Teorik Eğitimi' },

        // Pratik Eğitim
        { date: '2017-05-06', calendar: 'Pratik Eğitim', color: 'green', eventName: '1* Dalıcı Pratik Eğitimi (Enez)' },
        { date: '2017-05-07', calendar: 'Pratik Eğitim', color: 'green', eventName: '1* Dalıcı Pratik Eğitimi (Enez)' },

        // Diğer
        { date: '2017-03-18', calendar: 'Resmi Tatil', color: 'red', eventName: 'Çanakkale Zaferi' },
        { date: '2017-04-23', calendar: 'Resmi Tatil', color: 'red', eventName: 'Ulusal Egemenlik ve Çocuk Bayramı' },
        { date: '2017-05-01', calendar: 'Resmi Tatil', color: 'red', eventName: 'İşçi ve Emekçiler Bayramı' },
        { date: '2017-05-19', calendar: 'Resmi Tatil', color: 'red', eventName: 'Gençlik ve Spor Bayramı' },
        { date: '2017-06-24', calendar: 'Resmi Tatil', color: 'red', eventName: 'Ramazan Bayramı Arifesi' },
        { date: '2017-06-25', calendar: 'Resmi Tatil', color: 'red', eventName: 'Ramazan Bayramı 1. Günü' },
        { date: '2017-06-26', calendar: 'Resmi Tatil', color: 'red', eventName: 'Ramazan Bayramı 2. Günü' },
        { date: '2017-06-27', calendar: 'Resmi Tatil', color: 'red', eventName: 'Ramazan Bayramı 3. Günü' },
        { date: '2017-07-01', calendar: 'Resmi Tatil', color: 'red', eventName: 'Kabotaj ve Deniz Bayramı' },
        { date: '2017-08-30', calendar: 'Resmi Tatil', color: 'red', eventName: 'Zafer Bayramı' },
        { date: '2017-08-31', calendar: 'Resmi Tatil', color: 'red', eventName: 'Kurban Bayramı Arifesi' },
        { date: '2017-09-01', calendar: 'Resmi Tatil', color: 'red', eventName: 'Kurban Bayramı 1. Günü' },
        { date: '2017-09-02', calendar: 'Resmi Tatil', color: 'red', eventName: 'Kurban Bayramı 2. Günü' },
        { date: '2017-09-03', calendar: 'Resmi Tatil', color: 'red', eventName: 'Kurban Bayramı 3. Günü' },
        { date: '2017-09-04', calendar: 'Resmi Tatil', color: 'red', eventName: 'Kurban Bayramı 4. Günü' },
        { date: '2017-10-29', calendar: 'Resmi Tatil', color: 'red', eventName: 'Cumhuriyet Bayramı' },

        { date: '2017-02-02', calendar: 'Buluşma', color: 'orange', eventName: 'Tur Planlama ve Bröve Teslim Buluşması' },
        { date: '2017-03-27', calendar: 'Buluşma', color: 'orange', eventName: 'Dünya Tiyatrolar Günü`nde Tiyarto Etkinliği' },
        { date: '2017-12-08', calendar: 'Buluşma', color: 'orange', eventName: 'Sezonu Değerlendirme Buluşması' },

        { date: '2017-05-13', calendar: 'Sosyal Sorumluluk', color: 'red', eventName: 'Engelliler haftası' },
        { date: '2017-05-13', calendar: 'Sosyal Sorumluluk', color: 'blue', eventName: 'Engelli arkadaşlarımıza ücretsiz dalış etkinliği (Enez)' },

        { date: '2017-02-04', calendar: 'Seminer', color: 'yellow', eventName: 'TSSF Seminer' },
        { date: '2017-03-14', calendar: 'Seminer', color: 'yellow', eventName: '2017 PADI Member Forum' }
    ];


    var calendar = new Calendar('#calendar', data);

}();