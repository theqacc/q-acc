import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';
import { IconSort } from '@/components/icons/IconSort';
import { IconTotalDonations } from '@/components/icons/IconTotalDonations';
import { fetchProjectDonors } from '@/services/donation.service';
import {
  addCliff,
  formatDateMonthDayYear,
  getDifferenceFromPeriod,
  OneYearInMilliSecs,
} from '@/helpers/date';
import { formatAmount } from '@/helpers/donations';
import { IconViewTransaction } from '@/components/icons/IconViewTransaction';
import { useTokenPrice } from '@/hooks/useTokens';
import config from '@/config/configuration';
import { IProject } from '@/types/project.type';
import { useCheckSafeAccount } from '@/hooks/useCheckSafeAccount';
import { CHAIN_IMAGES, fetchUSDPrices } from '@/helpers/squidTransactions';
import { POLYGON_POS_CHAIN_IMAGE } from '@/components/project/project-details/ProjectDonationTable';
import { Spinner } from '@/components/loaders/Spinner';

interface ProjectUserDonationTableProps {
  userId: number;
  project: IProject;
  totalContributions: number;
}

const itemPerPage = 5;

enum EOrderBy {
  Date = 'Date',
  Round = 'Round',
  Amount = 'Amount',
  Tokens = 'Tokens',
}

enum EDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

const getStatusClassesBadges = (status: string) => {
  if (status === 'pending' || status === 'swap_pending')
    return 'bg-peach-400/10 text-peach-400 border-peach-400/30';
  if (status === 'failed')
    return 'bg-red-500/10 text-red-500 border-red-500/30';
  return 'bg-neutral-700 text-neutral-200 border-neutral-600';
};

const getStatusClassesAmount = (status: string) => {
  if (status === 'pending' || status === 'swap_pending')
    return ' text-peach-400 font-medium';
  if (status === 'failed') return ' text-red-500 font-medium';
  return 'text-neutral-200';
};

const ProjectUserDonationTable: React.FC<ProjectUserDonationTableProps> = ({
  userId,
  project,
  totalContributions,
}) => {
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageDonations, setPageDonations] = useState<any[]>([]);
  const { data: POLPrice } = useTokenPrice();
  const [usdPrices, setUsdPrices] = useState<any>({});
  const [usdPricesLoading, setUsdPricesLoading] = useState(false);


  const [order, setOrder] = useState<{ by: EOrderBy; direction: EDirection }>({
    by: EOrderBy.Date,
    direction: EDirection.DESC,
  });

  useEffect(() => {
    const fetchUserDonationData = async () => {
      if (!project?.id) return;
      // const data = await fetchUserDonations(userId);
      const donationsByProjectId = await fetchProjectDonors(
        Number(project.id),
        1000,
      );
      const userDonations = donationsByProjectId?.donations.filter(
        (donation: any) => donation.user.id == userId,
      );
      if (userDonations) {
        setTotalCount(userDonations.length);
        setPageDonations(
          userDonations.slice(page * itemPerPage, (page + 1) * itemPerPage),
        );
      }
    };

    fetchUserDonationData();
  }, [userId, project?.id, page, order]);

  useEffect(() => {
    const uniqueTokens = Array.from(
      new Set(
        pageDonations
          ?.map((donation: any) => {
            const chainId = donation.swapTransaction?.fromChainId;
            const tokenAddress = donation.swapTransaction?.fromTokenAddress;
            // Ensure both values exist before adding to the set
            return chainId && tokenAddress
              ? `${chainId}-${tokenAddress}`
              : null;
          })
          .filter(Boolean), // Remove null/undefined values
      ),
    ).map((key: any) => {
      const [chainId, tokenAddress] = key.split('-');
      return { chainId: Number(chainId), tokenAddress };
    });

    const getPrices = async () => {
      setUsdPricesLoading(true);
      const prices = await fetchUSDPrices(uniqueTokens);
      setUsdPrices(prices);
      setUsdPricesLoading(false);
    };
    getPrices();
  }, [pageDonations]);

  // Function to handle sorting
  const handleSort = (sortBy: EOrderBy) => {
    setOrder(prevOrder => ({
      by: sortBy,
      direction:
        prevOrder.by === sortBy && prevOrder.direction === EDirection.ASC
          ? EDirection.DESC
          : EDirection.ASC,
    }));
  };

  if (totalCount === 0) {
    return (
      <div className='container bg-neutral-800 w-full h-[500px] flex items-center justify-center text-[25px] font-bold text-neutral-300 rounded-2xl'>
        You haven't made any contributions to this project yet.
      </div>
    );
  }

  return (
    <div className='container flex flex-col py-10 md:px-6 gap-10'>
      {/* Summary Section */}
      <div className='flex justify-between p-4 bg-neutral-700/50 items-center rounded-xl'>
        <div className='flex gap-2'>
          <IconTotalDonations size={32} />
          <h1 className='text-neutral-200 md:text-[25px] font-bold '>
            All your contributions
          </h1>
        </div>
        <div className='flex gap-2 text-neutral-200 justify-center items-center '>
          <h1 className='md:text-[24px] font-bold '>
            ~ $ {formatAmount(totalContributions * Number(POLPrice))}
          </h1>
          <span className='font-medium'>
            {formatAmount(totalContributions)} POL
          </span>
        </div>
      </div>

      <div className='flex gap-10 lg:flex-row flex-col '>
        <div className='flex flex-col w-full font-redHatText overflow-x-auto'>
          <div className='flex justify-between px-10'>
            <div className='p-[8px_4px] flex gap-2 text-start w-full border-b-2 font-medium text-neutral-200 items-center min-w-[150px]'>
              Date
              <button onClick={() => handleSort(EOrderBy.Date)}>
                <IconSort size={16} />
              </button>
            </div>
            {/* <div className='p-[8px_4px] flex gap-2 text-start w-full border-b-2 font-medium text-[#1D1E1F] items-center min-w-[150px]'>
              Round
            </div> */}
            <div className='p-[8px_4px] flex gap-2 text-start w-full border-b-2 font-medium text-neutral-200 items-center min-w-[250px]'>
              Amount
              <button onClick={() => handleSort(EOrderBy.Amount)}>
                <IconSort size={16} />
              </button>
            </div>
            <div className='p-[8px_4px] flex gap-2 text-start w-full border-b-2 font-medium text-neutral-200 items-center min-w-[150px]'>
              Tokens
              <button onClick={() => handleSort(EOrderBy.Tokens)}>
                <IconSort size={16} />
              </button>
            </div>
            <div className='p-[8px_4px] flex gap-2 text-start w-full border-b-2 font-medium text-neutral-200 items-center min-w-[150px]'>
              Unlock Remaining
            </div>
            <div className='p-[8px_4px] flex gap-2 text-start w-full border-b-2 font-medium text-neutral-200 items-center min-w-[150px]'>
              Stream Details
            </div>
          </div>

          <div className='px-10'>
            {pageDonations.map(donation => {
              const tokenKey =
                donation.swapTransaction?.fromChainId +
                `-` +
                donation.swapTransaction?.fromTokenAddress;
              const tokenData = usdPrices[tokenKey] || {};
              const tokenUsdPrice = tokenData.usdPrice || Number(POLPrice);
              const tokenImageUrl =
                tokenData.imageUrl || POLYGON_POS_CHAIN_IMAGE;
              return (
                <div key={donation.id} className='flex justify-between'>
                  <div className='p-[18px_4px] flex gap-2 text-start border-b w-full min-w-[150px]'>
                    <div className='flex   items-center gap-2 flex-wrap'>
                      {formatDateMonthDayYear(donation.createdAt)}
                      {donation?.qfRound?.seasonNumber && (
                        <span className='px-2 py-[2px] border-2 border-neutral-300 bg-neutral-700/50 rounded-3xl text-xs text-neutral-200 font-medium leading-4'>
                          Season {donation.qfRound.seasonNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* <div className='p-[18px_4px] flex gap-2 text-start border-b w-full min-w-[150px]'>
    {isSafeAccount
      ? 'Early access'
      : donation.earlyAccessRound
        ? `Early access - Round ${donation.earlyAccessRound.roundNumber}`
        : 'q/acc round'}
  </div> */}
                  <div className='p-[18px_4px] flex gap-2 text-start  border-b w-full min-w-[250px]'>
                    <div className='flex gap-1 items-center'>
                      <div>
                        <div className='flex relative px-2'>
                          <div className='flex items-center'>
                            <div className='w-6 h-6  absolute right-6 p-[4px] rounded-full shadow-baseShadow'>
                              <img
                                className='rounded-full  w-full'
                                src={
                                  CHAIN_IMAGES[
                                    donation.swapTransaction?.fromChainId
                                  ] || POLYGON_POS_CHAIN_IMAGE
                                }
                                alt='From Chain  Logo'
                              />
                            </div>
                            <div className='w-6 h-6 z-10 p-[4px] rounded-full shadow-baseShadow'>
                              <img
                                className='rounded-full  w-full'
                                src={tokenImageUrl}
                                alt='To Chain Logo'
                                width={16}
                                height={16}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex flex-wrap items-center  gap-2 ${getStatusClassesAmount(donation.status)}`}
                      >
                        <div className='flex flex-col'>
                          <div className='flex gap-1 items-center flex-wrap'>
                            <span className='font-medium'>
                              {donation.fromTokenAmount
                                ? formatAmount(donation.fromTokenAmount)
                                : formatAmount(donation.amount)}
                            </span>
                            <span
                              className={`text-neutral-200 text-xs align-top font-medium ${getStatusClassesAmount(donation.status)} `}
                            >
                              {donation.swapTransaction?.fromTokenSymbol ||
                                'POL'}
                            </span>
                            <Link
                              target='_blank'
                              href={`${config.SCAN_URL}/tx/${donation.transactionId}`}
                            >
                              <IconViewTransaction
                                size={16}
                                color={`${donation.status === 'failed' ? '#fff' : donation.status === 'pending' || donation.status === 'swap_pending' ? '#FCD1AA' : '#FCD1AA'}`}
                              />
                            </Link>
                          </div>

                          <span
                            className={`text-xs font-medium  text-neutral-300 ${getStatusClassesAmount(donation.status)}`}
                          >
                            {usdPricesLoading ? (
                              <Spinner size={10} />
                            ) : (
                              <>
                                {donation.isSwap
                                  ? formatAmount(donation.amount) + ' POL'
                                  : ''}
                              </>
                            )}
                          </span>
                        </div>
                        {donation.status !== 'verified' && (
                          <span
                            className={`px-2 py-[2px] border-2  font-medium text-xs rounded-[50px] capitalize flex items-center ${getStatusClassesBadges(donation.status)}`}
                          >
                            {donation.status === 'pending' ||
                            donation.status === 'swap_pending' ? (
                              'Pending'
                            ) : (
                              <span>{donation.status}</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='p-[18px_4px] text-neutral-200 font-medium flex gap-2 text-start border-b w-full min-w-[150px] '>
                    {donation?.rewardTokenAmount
                      ? formatAmount(
                          Math.round(donation.rewardTokenAmount * 100) / 100,
                        ) +
                        ' ' +
                        project?.abc?.tokenTicker
                      : '-'}
                  </div>
                  <div className='p-[18px_4px] text-neutral-200 flex gap-2 text-start border-b w-full min-w-[150px]'>
                    {donation.rewardStreamStart
                      ? getDifferenceFromPeriod(
                          donation.rewardStreamStart,
                          donation.cliff / OneYearInMilliSecs,
                        )
                      : '-'}
                  </div>
                  <div className='p-[18px_4px] flex gap-2 text-start border-b w-full min-w-[150px]'>
                    {donation.rewardStreamStart !== null &&
                    donation.rewardStreamEnd !== null ? (
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {formatDateMonthDayYear(donation.rewardStreamEnd)} End
                        </span>
                        <span className='text-xs font-medium text-neutral-300'>
                          Starts on{' '}
                          {addCliff(donation.rewardStreamStart, donation.cliff)}
                        </span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className='flex justify-center'>
            <Pagination
              currentPage={page}
              totalCount={totalCount}
              setPage={setPage}
              itemPerPage={itemPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectUserDonationTable;
