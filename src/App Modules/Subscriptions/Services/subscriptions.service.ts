/*eslint-disable*/
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { SubscriptionDetails } from "../Models/subscriptiondetails.entity";
import { RepositoryUtil } from 'src/Shared Modules/Repository/repositoryutil'
import { SubscriptionPlanDTO } from "../DTOs/SubscriptionPlanDTO";
import { Duration, Price } from "src/Shared Modules/Enums/plans.enum";
import { SuccessResponsePaymentDTO } from "../DTOs/SuccessResponsePaymentDTO";
import { UserAccount } from "src/App Modules/Auth/Models/user.entity";

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly repositoryUtil: RepositoryUtil
    ) { }

    async getSubscriptionsOfUser(id: number): Promise<SubscriptionDetails[]> {
        try {
            const subscriptions = await this.repositoryUtil.getRepository(SubscriptionDetails)
                .find({
                    select: ['subscriptionenddate',
                        'subscriptionprice',
                        'subscriptionstatus',
                        'subscriptiontype'],
                    where: {
                        userid: id
                    }
                });

            if (!subscriptions) {
                throw new NotFoundException('No subscriptions available for current user');
            }

            return subscriptions as unknown as SubscriptionDetails[];

        } catch (err) {
            if (err instanceof NotFoundException)
                throw new NotFoundException('No subscriptions available for current user');
            throw new InternalServerErrorException('Erro happened while fetching subs from DB');
        }

    }

    async addNewPlan(id: number, subscriptionPlanDTO: SubscriptionPlanDTO)
        : Promise<SuccessResponsePaymentDTO> {

        try {
            const endDate = new Date();
            const duration = Duration[subscriptionPlanDTO.plan];
            endDate.setMonth(endDate.getMonth() + duration);

            const payedPrice = this
            .calculatePriceAfterDiscount(
                Price[subscriptionPlanDTO.plan], 
                subscriptionPlanDTO.discountPercent
                );
            
            console.log(payedPrice);
            await this.repositoryUtil.getRepository(SubscriptionDetails)
                .save({
                    userid: id,
                    subscriptionenddate: endDate,
                    subscriptionprice: payedPrice,
                    subscriptionstatus: 'PENDING',
                    subscriptiontype: subscriptionPlanDTO.plan
                });

            //Here supposed to be a payment gateway API to charge the price of thesubscription.
            //Add new record also to the billing history of the user for the plan payment transaction.
            //Admin MUST accept the plan subscription.     

            const billingAddress = await this.repositoryUtil.getRepository(UserAccount)
                .findOne({
                    select: ['billingaddress'],
                    where: {
                        userid: id
                    }
                });

            return new SuccessResponsePaymentDTO
                ('Visa Mastercard with Number: ****', billingAddress);
        }
        catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    calculatePriceAfterDiscount(price: number, discount: number) {
        return price - (price * (discount / 10));
    }


}